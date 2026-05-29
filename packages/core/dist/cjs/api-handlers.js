"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiHandlers = createApiHandlers;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const stats_1 = require("./stats");
const presentation_1 = require("./presentation");
const markdown_1 = require("./markdown");
const import_pack_1 = require("./import-pack");
const bulk_ops_1 = require("./bulk-ops");
const command_registry_1 = require("./command-registry");
const svg_import_1 = require("./svg-import");
const review_1 = require("./review");
const git_helper_1 = require("./git-helper");
const workspace_config_1 = require("./workspace-config");
const path_utils_1 = require("./path-utils");
const excalidraw_utils_1 = require("./excalidraw-utils");
const export_utils_1 = require("./export-utils");
const file_ops_1 = require("./file-ops");
const ai_import_1 = require("./ai-import");
/**
 * Build the transport-agnostic API surface from an engine and its host. Every
 * operation that used to be an `ipcMain.handle` body lives here exactly once,
 * with the renderer-facing argument shape. The Electron main process maps IPC
 * channels onto these functions; an in-process (non-Electron) host can hand the
 * returned object straight to the renderer's ApiProvider with no IPC at all.
 *
 * The shape mirrors the renderer's `window.api`; the Electron-only
 * `onMenuCommand` event subscription is supplied separately by the host.
 */
function createApiHandlers(engine, host = engine.host) {
    return {
        app: {
            ping: async () => shared_1.AppPingSchema.parse({ ok: true, version: host.appVersion, platform: host.platform }),
        },
        profiles: {
            list: async () => shared_1.ProfileListSchema.parse({ profiles: await engine.profileStore.list() }),
            getActive: async () => {
                const active = await engine.profileStore.getActive();
                return active ? shared_1.ProfileSchema.parse(active) : null;
            },
            setActive: async (id) => {
                await engine.profileStore.setActive(id);
                await engine.bindProfile(id);
                return { success: true };
            },
            create: async (name) => shared_1.ProfileSchema.parse(await engine.profileStore.create(name)),
            rename: async (id, name) => shared_1.ProfileSchema.parse(await engine.profileStore.rename(id, name)),
            delete: async (id) => {
                await engine.profileStore.delete(id);
                const active = await engine.profileStore.getActive();
                if (active)
                    await engine.bindProfile(active.id);
                return { success: true };
            },
        },
        settings: {
            get: async () => shared_1.SettingsSchema.parse(engine.settingsStore.get()),
            update: async (partial) => shared_1.SettingsSchema.parse(await engine.settingsStore.update(partial)),
        },
        workspaces: {
            list: async () => shared_1.WorkspaceListSchema.parse({ workspaces: await engine.workspaceStore.list() }),
            add: async () => {
                const dirPath = await host.pickDirectory();
                if (!dirPath)
                    return null;
                const workspace = await engine.workspaceStore.add(path.basename(dirPath), dirPath);
                return shared_1.WorkspaceSchema.parse(workspace);
            },
            remove: async (id) => {
                await engine.workspaceStore.remove(id);
                return { success: true };
            },
            setActive: async (id) => {
                await engine.workspaceStore.setActive(id);
                return { success: true };
            },
            getActive: async () => {
                const active = await engine.workspaceStore.getActive();
                return active ? shared_1.WorkspaceSchema.parse(active) : null;
            },
            listFiles: async (workspaceId, subDir = '') => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const targetDir = path.join(workspace.path, subDir);
                if (!(0, path_utils_1.isPathWithin)(workspace.path, targetDir) &&
                    path.resolve(targetDir) !== path.resolve(workspace.path)) {
                    throw new Error('Access denied: Path outside workspace');
                }
                const items = await fs.readdir(targetDir, { withFileTypes: true });
                return items
                    .filter((item) => !item.name.startsWith('.'))
                    .map((item) => {
                    const fullPath = path.join(targetDir, item.name);
                    const stats = fs.statSync(fullPath);
                    return {
                        name: item.name,
                        path: fullPath,
                        isDirectory: item.isDirectory(),
                        size: stats.size,
                        mtime: stats.mtimeMs,
                        extension: path.extname(item.name).toLowerCase(),
                    };
                })
                    .filter((file) => file.isDirectory ? true : ['.excalidraw', '.png', '.svg', '.json'].includes(file.extension || ''))
                    .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
            },
            readFile: async (workspaceId, filePath) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
                    throw new Error('Access denied: Path outside workspace');
                return await fs.readFile(filePath, 'utf-8');
            },
            readExcalidrawFile: async (workspaceId, filePath) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
                    throw new Error('Access denied: Path outside workspace');
                return await (0, excalidraw_utils_1.readExcalidrawFile)(filePath);
            },
            writeFile: async (workspaceId, filePath, content) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                engine.assertWritable(workspace, filePath);
                if (engine.settingsStore.get().keepBackups) {
                    await engine.backupManager.backup(filePath).catch(() => undefined);
                }
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, content, 'utf-8');
                engine.getIndex(workspace.path).invalidate();
                return { success: true };
            },
            writeBinaryFile: async (workspaceId, filePath, base64) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                engine.assertWritable(workspace, filePath);
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, (0, export_utils_1.dataUrlToBuffer)(base64));
                engine.getIndex(workspace.path).invalidate();
                return { success: true };
            },
            deleteFile: async (workspaceId, filePath) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
                    throw new Error('Access denied: Path outside workspace');
                await host.trashItem(filePath);
                engine.getIndex(workspace.path).invalidate();
                return { success: true };
            },
            renameFile: async (workspaceId, filePath, newName) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, file_ops_1.renameEntry)(workspace.path, filePath, newName);
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
            moveFile: async (workspaceId, filePath, destDir) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, file_ops_1.moveEntry)(workspace.path, filePath, destDir);
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
            copyFile: async (workspaceId, filePath, destDir) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, file_ops_1.copyEntry)(workspace.path, filePath, destDir);
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
            createFile: async (workspaceId, dir, name) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, file_ops_1.createExcalidrawFile)(workspace.path, dir ?? workspace.path, name);
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
            createFolder: async (workspaceId, dir, name) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                return await (0, file_ops_1.createFolder)(workspace.path, dir ?? workspace.path, name);
            },
            search: async (workspaceId, query) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const config = await new workspace_config_1.WorkspaceConfigStore(workspace.path).get();
                const index = engine.getIndex(workspace.path);
                index.setExcludes(config.excludeGlobs);
                return await index.search(query || '');
            },
            getTags: async (workspaceId) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                return await engine.getIndex(workspace.path).getTags();
            },
            setTags: async (workspaceId, filePath, tags) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
                    throw new Error('Access denied: Path outside workspace');
                return await engine.getIndex(workspace.path).setTags(filePath, tags);
            },
            exportFile: async (workspaceId, filePath, format, data, scene) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                engine.assertWritable(workspace, filePath);
                await fs.ensureDir(path.dirname(filePath));
                if (format === 'png') {
                    await fs.writeFile(filePath, (0, export_utils_1.embedSceneInPng)((0, export_utils_1.dataUrlToBuffer)(data), scene));
                }
                else if (format === 'svg') {
                    await fs.writeFile(filePath, (0, export_utils_1.embedSceneInSvg)(data, scene), 'utf-8');
                }
                else {
                    await fs.writeFile(filePath, JSON.stringify(scene, null, 2), 'utf-8');
                }
                engine.getIndex(workspace.path).invalidate();
                return { success: true, path: filePath };
            },
        },
        plugins: {
            list: async () => shared_1.PluginListSchema.parse({ plugins: await engine.pluginManager.list() }),
            getContributions: async () => await engine.pluginManager.getContributions(),
            installFromFolder: async () => {
                const dir = await host.pickDirectory({ title: 'Select a plugin folder (must contain plugin.json)' });
                if (!dir)
                    return null;
                return await engine.pluginManager.installFromFolder(dir);
            },
            enable: async (id) => {
                await engine.pluginManager.setEnabled(id, true);
                return { success: true };
            },
            disable: async (id) => {
                await engine.pluginManager.setEnabled(id, false);
                return { success: true };
            },
            uninstall: async (id) => {
                await engine.pluginManager.uninstall(id);
                return { success: true };
            },
        },
        ai: {
            validate: async (raw) => (0, shared_1.validateRawPayload)(raw || ''),
            apply: async (payload) => {
                const parsed = shared_1.AiPayloadSchema.parse(payload);
                const active = await engine.profileStore.getActive();
                if (!active)
                    throw new Error('No active profile');
                const profileDir = engine.profileStore.getProfileDir(active.id);
                return await (0, ai_import_1.applyAiPayload)(profileDir, parsed, (partial) => engine.settingsStore.update(partial).then(() => { }));
            },
        },
        templates: {
            list: async () => shared_1.TemplateListSchema.parse({ templates: await engine.templateStore.list() }),
            apply: async (id) => await engine.templateStore.get(id),
            save: async (input) => await engine.templateStore.save(input),
        },
        recents: {
            list: async () => shared_1.RecentFileListSchema.parse({ recents: await engine.recentsStore.prune() }),
            add: async (entry) => shared_1.RecentFileListSchema.parse({ recents: await engine.recentsStore.add(entry) }),
            remove: async (filePath) => shared_1.RecentFileListSchema.parse({ recents: await engine.recentsStore.remove(filePath) }),
            clear: async () => {
                await engine.recentsStore.clear();
                return { success: true };
            },
        },
        libraries: {
            list: async () => shared_1.LibraryListSchema.parse({ libraries: await engine.libraryStore.list() }),
            get: async (id) => shared_1.LibrarySchema.parse(await engine.libraryStore.get(id)),
            import: async () => {
                const file = await host.pickFile({
                    filters: [{ name: 'Excalidraw Library', extensions: ['excalidrawlib', 'json'] }],
                });
                if (!file)
                    return null;
                return await engine.libraryStore.importFromFile(file);
            },
            addItems: async (id, items) => await engine.libraryStore.addItems(id, items),
            remove: async (id) => {
                await engine.libraryStore.remove(id);
                return { success: true };
            },
            export: async (id) => ({ json: await engine.libraryStore.exportJson(id) }),
        },
        bulk: {
            rename: async (workspaceId, files, options) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, bulk_ops_1.bulkRename)(workspace.path, files, shared_1.BulkRenameOptionsSchema.parse(options));
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
            delete: async (workspaceId, files) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, bulk_ops_1.bulkDelete)(workspace.path, files, (p) => host.trashItem(p));
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
            move: async (workspaceId, files, destDir) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const res = await (0, bulk_ops_1.bulkMove)(workspace.path, files, destDir);
                engine.getIndex(workspace.path).invalidate();
                return res;
            },
        },
        presentation: {
            getDeck: async (workspaceId, filePath, scene) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const rel = (0, path_utils_1.isPathWithin)(workspace.path, filePath) ? path.relative(workspace.path, filePath) : 'scratch';
                return await (0, presentation_1.getDeck)(workspace.path, rel, scene);
            },
            setNotes: async (workspaceId, filePath, slideId, notes) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const rel = (0, path_utils_1.isPathWithin)(workspace.path, filePath) ? path.relative(workspace.path, filePath) : 'scratch';
                await (0, presentation_1.setSlideNotes)(workspace.path, rel, slideId, notes);
                return { success: true };
            },
        },
        review: {
            get: async (workspaceId, filePath) => await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).get(filePath),
            addPin: async (workspaceId, filePath, x, y, author, body) => await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).addPin(filePath, x, y, author, body),
            addComment: async (workspaceId, filePath, pinId, author, body) => await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).addComment(filePath, pinId, author, body),
            setResolved: async (workspaceId, filePath, pinId, resolved) => await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).setResolved(filePath, pinId, resolved),
            deletePin: async (workspaceId, filePath, pinId) => await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).deletePin(filePath, pinId),
        },
        stats: {
            compute: async (workspaceId) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const tags = await engine.getIndex(workspace.path).getTags();
                return shared_1.WorkspaceStatsSchema.parse(await (0, stats_1.computeStats)(workspace.path, tags));
            },
        },
        git: {
            status: async (workspaceId) => await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).status(),
            commit: async (workspaceId, message, files) => ({
                output: await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).commit(message, files),
            }),
            log: async (workspaceId, limit) => ({
                entries: await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).log(limit),
            }),
            init: async (workspaceId) => {
                await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).init();
                return { success: true };
            },
        },
        commands: {
            list: async () => {
                const contributions = await engine.pluginManager.getContributions();
                return { commands: (0, command_registry_1.buildCommandList)(contributions) };
            },
        },
        backups: {
            list: async (originalPath) => ({ backups: engine.backupManager.list(originalPath) }),
            restore: async (id, destPath) => ({
                path: await engine.backupManager.restore(id, destPath),
            }),
        },
        markdown: {
            export: async (workspaceId, baseName, options, imageData, scene, bodyText) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const bundle = await (0, markdown_1.writeMarkdownBundle)(workspace.path, baseName, shared_1.MarkdownOptionsSchema.parse(options), imageData, scene, bodyText || '');
                engine.getIndex(workspace.path).invalidate();
                return bundle;
            },
        },
        import: {
            pickImage: async () => {
                const file = await host.pickFile({
                    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] }],
                });
                if (!file)
                    return null;
                return await (0, import_pack_1.buildImageInsertion)(file);
            },
            pickSvgAsElements: async () => {
                const file = await host.pickFile({ filters: [{ name: 'SVG', extensions: ['svg'] }] });
                if (!file)
                    return null;
                const svg = await fs.readFile(file, 'utf-8');
                return (0, svg_import_1.parseSvgToElements)(svg);
            },
        },
        snippets: {
            list: async () => ({ snippets: await engine.snippetStore.list() }),
            get: async (id) => await engine.snippetStore.get(id),
            save: async (input) => await engine.snippetStore.save(input),
            remove: async (id) => {
                await engine.snippetStore.remove(id);
                return { success: true };
            },
            rename: async (id, title) => await engine.snippetStore.rename(id, title),
        },
        shortcuts: {
            list: async () => ({ bindings: engine.shortcutStore.list() }),
            set: async (commandId, accelerator, force) => ({
                bindings: await engine.shortcutStore.set(commandId, accelerator, force),
            }),
            reset: async (commandId) => ({ bindings: await engine.shortcutStore.reset(commandId) }),
        },
        workspaceConfig: {
            get: async (workspaceId) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                return await new workspace_config_1.WorkspaceConfigStore(workspace.path).get();
            },
            update: async (workspaceId, partial) => {
                const workspace = await engine.getWorkspaceOrThrow(workspaceId);
                const next = await new workspace_config_1.WorkspaceConfigStore(workspace.path).update(partial);
                engine.getIndex(workspace.path).setExcludes(next.excludeGlobs);
                return next;
            },
        },
        styles: {
            list: async () => ({ presets: engine.stylePresetStore.list() }),
            save: async (input) => await engine.stylePresetStore.save(input),
            remove: async (id) => {
                await engine.stylePresetStore.remove(id);
                return { success: true };
            },
        },
    };
}
function reviewStoreFor(workspace) {
    return new review_1.ReviewStore(workspace.path);
}
function gitFor(workspace) {
    return new git_helper_1.GitHelper(workspace.path);
}

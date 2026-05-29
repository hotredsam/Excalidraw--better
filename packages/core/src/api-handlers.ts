import * as path from 'path';
import * as fs from 'fs-extra';
import {
  AppPingSchema,
  ProfileSchema,
  ProfileListSchema,
  SettingsSchema,
  WorkspaceSchema,
  WorkspaceListSchema,
  PluginListSchema,
  validateRawPayload,
  AiPayloadSchema,
  TemplateListSchema,
  RecentFileListSchema,
  LibraryListSchema,
  LibrarySchema,
  BulkRenameOptionsSchema,
  WorkspaceStatsSchema,
  MarkdownOptionsSchema,
  Workspace,
} from '@excalibur/shared';
import type { ExcaliburApi } from '@excalibur/api-contract';
import { HostServices } from './host';
import { ExcaliburEngine } from './engine';
import { computeStats } from './stats';
import { getDeck, setSlideNotes } from './presentation';
import { writeMarkdownBundle } from './markdown';
import { buildImageInsertion } from './import-pack';
import { bulkRename, bulkDelete, bulkMove } from './bulk-ops';
import { buildCommandList } from './command-registry';
import { parseSvgToElements } from './svg-import';
import { ReviewStore } from './review';
import { GitHelper } from './git-helper';
import { WorkspaceConfigStore } from './workspace-config';
import { isPathWithin } from './path-utils';
import { readExcalidrawFile } from './excalidraw-utils';
import { embedSceneInPng, embedSceneInSvg, dataUrlToBuffer } from './export-utils';
import { renameEntry, moveEntry, copyEntry, createExcalidrawFile, createFolder } from './file-ops';
import { applyAiPayload } from './ai-import';

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
export function createApiHandlers(engine: ExcaliburEngine, host: HostServices = engine.host): ExcaliburApi {
  return {
    app: {
      ping: async () =>
        AppPingSchema.parse({ ok: true, version: host.appVersion, platform: host.platform }),
    },

    profiles: {
      list: async () => ProfileListSchema.parse({ profiles: await engine.profileStore.list() }),
      getActive: async () => {
        const active = await engine.profileStore.getActive();
        return active ? ProfileSchema.parse(active) : null;
      },
      setActive: async (id: string) => {
        await engine.profileStore.setActive(id);
        await engine.bindProfile(id);
        return { success: true };
      },
      create: async (name: string) => ProfileSchema.parse(await engine.profileStore.create(name)),
      rename: async (id: string, name: string) =>
        ProfileSchema.parse(await engine.profileStore.rename(id, name)),
      delete: async (id: string) => {
        await engine.profileStore.delete(id);
        const active = await engine.profileStore.getActive();
        if (active) await engine.bindProfile(active.id);
        return { success: true };
      },
    },

    settings: {
      get: async () => SettingsSchema.parse(engine.settingsStore.get()),
      update: async (partial: any) => SettingsSchema.parse(await engine.settingsStore.update(partial)),
    },

    workspaces: {
      list: async () => WorkspaceListSchema.parse({ workspaces: await engine.workspaceStore.list() }),
      add: async () => {
        const dirPath = await host.pickDirectory();
        if (!dirPath) return null;
        const workspace = await engine.workspaceStore.add(path.basename(dirPath), dirPath);
        return WorkspaceSchema.parse(workspace);
      },
      remove: async (id: string) => {
        await engine.workspaceStore.remove(id);
        return { success: true };
      },
      setActive: async (id: string | null) => {
        await engine.workspaceStore.setActive(id as any);
        return { success: true };
      },
      getActive: async () => {
        const active = await engine.workspaceStore.getActive();
        return active ? WorkspaceSchema.parse(active) : null;
      },
      listFiles: async (workspaceId: string, subDir = '') => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const targetDir = path.join(workspace.path, subDir);
        if (
          !isPathWithin(workspace.path, targetDir) &&
          path.resolve(targetDir) !== path.resolve(workspace.path)
        ) {
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
          .filter((file) =>
            file.isDirectory ? true : ['.excalidraw', '.png', '.svg', '.json'].includes(file.extension || ''),
          )
          .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
      },
      readFile: async (workspaceId: string, filePath: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
        return await fs.readFile(filePath, 'utf-8');
      },
      readExcalidrawFile: async (workspaceId: string, filePath: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
        return await readExcalidrawFile(filePath);
      },
      writeFile: async (workspaceId: string, filePath: string, content: string) => {
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
      writeBinaryFile: async (workspaceId: string, filePath: string, base64: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        engine.assertWritable(workspace, filePath);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, dataUrlToBuffer(base64));
        engine.getIndex(workspace.path).invalidate();
        return { success: true };
      },
      deleteFile: async (workspaceId: string, filePath: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
        await host.trashItem(filePath);
        engine.getIndex(workspace.path).invalidate();
        return { success: true };
      },
      renameFile: async (workspaceId: string, filePath: string, newName: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await renameEntry(workspace.path, filePath, newName);
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
      moveFile: async (workspaceId: string, filePath: string, destDir: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await moveEntry(workspace.path, filePath, destDir);
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
      copyFile: async (workspaceId: string, filePath: string, destDir?: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await copyEntry(workspace.path, filePath, destDir as any);
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
      createFile: async (workspaceId: string, dir: string | null, name: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await createExcalidrawFile(workspace.path, dir ?? workspace.path, name);
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
      createFolder: async (workspaceId: string, dir: string | null, name: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        return await createFolder(workspace.path, dir ?? workspace.path, name);
      },
      search: async (workspaceId: string, query: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const config = await new WorkspaceConfigStore(workspace.path).get();
        const index = engine.getIndex(workspace.path);
        index.setExcludes(config.excludeGlobs);
        return await index.search(query || '');
      },
      getTags: async (workspaceId: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        return await engine.getIndex(workspace.path).getTags();
      },
      setTags: async (workspaceId: string, filePath: string, tags: string[]) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
        return await engine.getIndex(workspace.path).setTags(filePath, tags);
      },
      exportFile: async (
        workspaceId: string,
        filePath: string,
        format: 'png' | 'svg' | 'json',
        data: string,
        scene: any,
      ) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        engine.assertWritable(workspace, filePath);
        await fs.ensureDir(path.dirname(filePath));
        if (format === 'png') {
          await fs.writeFile(filePath, embedSceneInPng(dataUrlToBuffer(data), scene));
        } else if (format === 'svg') {
          await fs.writeFile(filePath, embedSceneInSvg(data, scene), 'utf-8');
        } else {
          await fs.writeFile(filePath, JSON.stringify(scene, null, 2), 'utf-8');
        }
        engine.getIndex(workspace.path).invalidate();
        return { success: true, path: filePath };
      },
    },

    plugins: {
      list: async () => PluginListSchema.parse({ plugins: await engine.pluginManager.list() }),
      getContributions: async () => await engine.pluginManager.getContributions(),
      installFromFolder: async () => {
        const dir = await host.pickDirectory({ title: 'Select a plugin folder (must contain plugin.json)' });
        if (!dir) return null;
        return await engine.pluginManager.installFromFolder(dir);
      },
      enable: async (id: string) => {
        await engine.pluginManager.setEnabled(id, true);
        return { success: true };
      },
      disable: async (id: string) => {
        await engine.pluginManager.setEnabled(id, false);
        return { success: true };
      },
      uninstall: async (id: string) => {
        await engine.pluginManager.uninstall(id);
        return { success: true };
      },
    },

    ai: {
      validate: async (raw: string) => validateRawPayload(raw || ''),
      apply: async (payload: any) => {
        const parsed = AiPayloadSchema.parse(payload);
        const active = await engine.profileStore.getActive();
        if (!active) throw new Error('No active profile');
        const profileDir = engine.profileStore.getProfileDir(active.id);
        return await applyAiPayload(profileDir, parsed, (partial) =>
          engine.settingsStore.update(partial).then(() => {}),
        );
      },
    },

    templates: {
      list: async () => TemplateListSchema.parse({ templates: await engine.templateStore.list() }),
      apply: async (id: string) => await engine.templateStore.get(id),
      save: async (input: any) => await engine.templateStore.save(input),
    },

    recents: {
      list: async () => RecentFileListSchema.parse({ recents: await engine.recentsStore.prune() }),
      add: async (entry: any) => RecentFileListSchema.parse({ recents: await engine.recentsStore.add(entry) }),
      remove: async (filePath: string) =>
        RecentFileListSchema.parse({ recents: await engine.recentsStore.remove(filePath) }),
      clear: async () => {
        await engine.recentsStore.clear();
        return { success: true };
      },
    },

    libraries: {
      list: async () => LibraryListSchema.parse({ libraries: await engine.libraryStore.list() }),
      get: async (id: string) => LibrarySchema.parse(await engine.libraryStore.get(id)),
      import: async () => {
        const file = await host.pickFile({
          filters: [{ name: 'Excalidraw Library', extensions: ['excalidrawlib', 'json'] }],
        });
        if (!file) return null;
        return await engine.libraryStore.importFromFile(file);
      },
      addItems: async (id: string, items: any[]) => await engine.libraryStore.addItems(id, items),
      remove: async (id: string) => {
        await engine.libraryStore.remove(id);
        return { success: true };
      },
      export: async (id: string) => ({ json: await engine.libraryStore.exportJson(id) }),
    },

    bulk: {
      rename: async (workspaceId: string, files: string[], options: any) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await bulkRename(workspace.path, files, BulkRenameOptionsSchema.parse(options));
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
      delete: async (workspaceId: string, files: string[]) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await bulkDelete(workspace.path, files, (p) => host.trashItem(p));
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
      move: async (workspaceId: string, files: string[], destDir: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const res = await bulkMove(workspace.path, files, destDir);
        engine.getIndex(workspace.path).invalidate();
        return res;
      },
    },

    presentation: {
      getDeck: async (workspaceId: string, filePath: string, scene: any) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const rel = isPathWithin(workspace.path, filePath) ? path.relative(workspace.path, filePath) : 'scratch';
        return await getDeck(workspace.path, rel, scene);
      },
      setNotes: async (workspaceId: string, filePath: string, slideId: string, notes: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const rel = isPathWithin(workspace.path, filePath) ? path.relative(workspace.path, filePath) : 'scratch';
        await setSlideNotes(workspace.path, rel, slideId, notes);
        return { success: true };
      },
    },

    review: {
      get: async (workspaceId: string, filePath: string) =>
        await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).get(filePath),
      addPin: async (workspaceId: string, filePath: string, x: number, y: number, author: string, body: string) =>
        await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).addPin(filePath, x, y, author, body),
      addComment: async (workspaceId: string, filePath: string, pinId: string, author: string, body: string) =>
        await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).addComment(filePath, pinId, author, body),
      setResolved: async (workspaceId: string, filePath: string, pinId: string, resolved: boolean) =>
        await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).setResolved(filePath, pinId, resolved),
      deletePin: async (workspaceId: string, filePath: string, pinId: string) =>
        await reviewStoreFor(await engine.getWorkspaceOrThrow(workspaceId)).deletePin(filePath, pinId),
    },

    stats: {
      compute: async (workspaceId: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const tags = await engine.getIndex(workspace.path).getTags();
        return WorkspaceStatsSchema.parse(await computeStats(workspace.path, tags));
      },
    },

    git: {
      status: async (workspaceId: string) =>
        await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).status(),
      commit: async (workspaceId: string, message: string, files?: string[]) => ({
        output: await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).commit(message, files),
      }),
      log: async (workspaceId: string, limit?: number) => ({
        entries: await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).log(limit),
      }),
      init: async (workspaceId: string) => {
        await gitFor(await engine.getWorkspaceOrThrow(workspaceId)).init();
        return { success: true };
      },
    },

    commands: {
      list: async () => {
        const contributions = await engine.pluginManager.getContributions();
        return { commands: buildCommandList(contributions) };
      },
    },

    backups: {
      list: async (originalPath?: string) => ({ backups: engine.backupManager.list(originalPath as any) }),
      restore: async (id: string, destPath?: string) => ({
        path: await engine.backupManager.restore(id, destPath as any),
      }),
    },

    markdown: {
      export: async (
        workspaceId: string,
        baseName: string,
        options: any,
        imageData: string,
        scene: any,
        bodyText?: string,
      ) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const bundle = await writeMarkdownBundle(
          workspace.path,
          baseName,
          MarkdownOptionsSchema.parse(options),
          imageData,
          scene,
          bodyText || '',
        );
        engine.getIndex(workspace.path).invalidate();
        return bundle;
      },
    },

    import: {
      pickImage: async () => {
        const file = await host.pickFile({
          filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] }],
        });
        if (!file) return null;
        return await buildImageInsertion(file);
      },
      pickSvgAsElements: async () => {
        const file = await host.pickFile({ filters: [{ name: 'SVG', extensions: ['svg'] }] });
        if (!file) return null;
        const svg = await fs.readFile(file, 'utf-8');
        return parseSvgToElements(svg);
      },
    },

    snippets: {
      list: async () => ({ snippets: await engine.snippetStore.list() }),
      get: async (id: string) => await engine.snippetStore.get(id),
      save: async (input: any) => await engine.snippetStore.save(input),
      remove: async (id: string) => {
        await engine.snippetStore.remove(id);
        return { success: true };
      },
      rename: async (id: string, title: string) => await engine.snippetStore.rename(id, title),
    },

    shortcuts: {
      list: async () => ({ bindings: engine.shortcutStore.list() }),
      set: async (commandId: string, accelerator: string, force?: boolean) => ({
        bindings: await engine.shortcutStore.set(commandId, accelerator, force as any),
      }),
      reset: async (commandId?: string) => ({ bindings: await engine.shortcutStore.reset(commandId as any) }),
    },

    workspaceConfig: {
      get: async (workspaceId: string) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        return await new WorkspaceConfigStore(workspace.path).get();
      },
      update: async (workspaceId: string, partial: any) => {
        const workspace = await engine.getWorkspaceOrThrow(workspaceId);
        const next = await new WorkspaceConfigStore(workspace.path).update(partial);
        engine.getIndex(workspace.path).setExcludes(next.excludeGlobs);
        return next;
      },
    },

    styles: {
      list: async () => ({ presets: engine.stylePresetStore.list() }),
      save: async (input: any) => await engine.stylePresetStore.save(input),
      remove: async (id: string) => {
        await engine.stylePresetStore.remove(id);
        return { success: true };
      },
    },
  };
}

function reviewStoreFor(workspace: Workspace) {
  return new ReviewStore(workspace.path);
}

function gitFor(workspace: Workspace) {
  return new GitHelper(workspace.path);
}

/** The transport-agnostic API surface produced by {@link createApiHandlers}. */
export type { ExcaliburApi } from '@excalibur/api-contract';

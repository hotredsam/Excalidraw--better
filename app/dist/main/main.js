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
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ipc_1 = require("@excalibur/ipc");
const shared_1 = require("@excalibur/shared");
const profile_1 = require("./profile");
const settings_1 = require("./settings");
const workspace_1 = require("./workspace");
const plugins_1 = require("./plugins");
const templates_1 = require("./templates");
const path_utils_1 = require("./path-utils");
const excalidraw_utils_1 = require("./excalidraw-utils");
const search_1 = require("./search");
const export_utils_1 = require("./export-utils");
const file_ops_1 = require("./file-ops");
const ai_import_1 = require("./ai-import");
let profileStore;
let settingsStore;
let workspaceStore;
let pluginManager;
let templateStore;
function builtinPluginsDir() {
    return electron_1.app.isPackaged
        ? path.join(process.resourcesPath, 'plugins')
        : path.join(__dirname, '../../../plugins');
}
async function bindProfile(profileId) {
    const profileDir = profileStore.getProfileDir(profileId);
    settingsStore = new settings_1.SettingsStore(profileDir);
    await settingsStore.init();
    workspaceStore = new workspace_1.WorkspaceStore(profileDir);
    await workspaceStore.init();
    pluginManager = new plugins_1.PluginManager(profileDir, builtinPluginsDir());
    await pluginManager.init();
    templateStore = new templates_1.TemplateStore(profileDir);
    await templateStore.init();
}
async function initStores() {
    profileStore = new profile_1.ProfileStore();
    await profileStore.init();
    const activeProfile = await profileStore.getActive();
    if (activeProfile) {
        await bindProfile(activeProfile.id);
    }
}
async function getWorkspaceOrThrow(workspaceId) {
    const workspaces = await workspaceStore.list();
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (!workspace)
        throw new Error('Workspace not found');
    return workspace;
}
function assertWritable(workspace, filePath) {
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath)) {
        throw new Error('Access denied: Path outside workspace');
    }
    if ((0, path_utils_1.isDangerousPath)(filePath)) {
        throw new Error('Access denied: Dangerous path');
    }
}
function createWindow() {
    const isDev = process.env.NODE_ENV === 'development';
    const mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 832,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
        backgroundColor: '#0B0D12',
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../../ui/dist/index.html'));
    }
    // Security: deny in-app navigation and route external links to the OS browser.
    mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    buildMenu(mainWindow);
}
/**
 * Native application menu with the spec'd keyboard accelerators. Each item
 * forwards a lightweight `menu:command` event to the renderer, which performs
 * the action against the active canvas.
 */
function buildMenu(win) {
    const send = (cmd) => win.webContents.send('menu:command', cmd);
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'Open File…', accelerator: 'CmdOrCtrl+O', click: () => send('open') },
                { label: 'New Drawing', accelerator: 'CmdOrCtrl+N', click: () => send('new') },
                { type: 'separator' },
                { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('save') },
                { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('save-as') },
                { label: 'Export…', accelerator: 'CmdOrCtrl+P', click: () => send('export') },
                { type: 'separator' },
                { role: process.platform === 'darwin' ? 'close' : 'quit' },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
                { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { label: 'Toggle Plugins Panel', accelerator: 'CmdOrCtrl+Shift+P', click: () => send('toggle-plugins') },
                { label: 'Toggle AI Import', accelerator: 'CmdOrCtrl+I', click: () => send('toggle-ai') },
                { type: 'separator' },
                { role: 'reload' }, { role: 'toggleDevTools' }, { role: 'togglefullscreen' },
            ],
        },
    ];
    electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(template));
}
// ── App ──────────────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.APP_CHANNELS.PING, async () => {
    return shared_1.AppPingSchema.parse({ ok: true, version: electron_1.app.getVersion(), platform: process.platform });
});
// ── Profiles ─────────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.LIST, async () => {
    return shared_1.ProfileListSchema.parse({ profiles: await profileStore.list() });
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.GET_ACTIVE, async () => {
    const active = await profileStore.getActive();
    return active ? shared_1.ProfileSchema.parse(active) : null;
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.CREATE, async (_, { name }) => {
    return shared_1.ProfileSchema.parse(await profileStore.create(name));
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.RENAME, async (_, { id, name }) => {
    return shared_1.ProfileSchema.parse(await profileStore.rename(id, name));
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.DELETE, async (_, { id }) => {
    await profileStore.delete(id);
    const active = await profileStore.getActive();
    if (active)
        await bindProfile(active.id);
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.SET_ACTIVE, async (_, { id }) => {
    await profileStore.setActive(id);
    await bindProfile(id);
    return { success: true };
});
// ── Settings ─────────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.SETTINGS_CHANNELS.GET, async () => shared_1.SettingsSchema.parse(settingsStore.get()));
electron_1.ipcMain.handle(ipc_1.SETTINGS_CHANNELS.UPDATE, async (_, partial) => {
    return shared_1.SettingsSchema.parse(await settingsStore.update(partial));
});
// ── Workspaces ───────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.LIST, async () => {
    return shared_1.WorkspaceListSchema.parse({ workspaces: await workspaceStore.list() });
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.GET_ACTIVE, async () => {
    const active = await workspaceStore.getActive();
    return active ? shared_1.WorkspaceSchema.parse(active) : null;
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.ADD, async (event) => {
    const result = await electron_1.dialog.showOpenDialog(electron_1.BrowserWindow.fromWebContents(event.sender), {
        properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    const dirPath = result.filePaths[0];
    const workspace = await workspaceStore.add(path.basename(dirPath), dirPath);
    return shared_1.WorkspaceSchema.parse(workspace);
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.SET_ACTIVE, async (_, { id }) => {
    await workspaceStore.setActive(id);
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.REMOVE, async (_, { id }) => {
    await workspaceStore.remove(id);
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.LIST_FILES, async (_, { workspaceId, subDir = '' }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    const targetDir = path.join(workspace.path, subDir);
    if (!(0, path_utils_1.isPathWithin)(workspace.path, targetDir) && path.resolve(targetDir) !== path.resolve(workspace.path)) {
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
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, async (_, { workspaceId, filePath }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
        throw new Error('Access denied: Path outside workspace');
    return await (0, excalidraw_utils_1.readExcalidrawFile)(filePath);
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.READ_FILE, async (_, { workspaceId, filePath }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
        throw new Error('Access denied: Path outside workspace');
    return await fs.readFile(filePath, 'utf-8');
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.WRITE_FILE, async (_, { workspaceId, filePath, content }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    assertWritable(workspace, filePath);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
    (0, search_1.getIndex)(workspace.path).invalidate();
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.WRITE_BINARY_FILE, async (_, { workspaceId, filePath, base64 }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    assertWritable(workspace, filePath);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, (0, export_utils_1.dataUrlToBuffer)(base64));
    (0, search_1.getIndex)(workspace.path).invalidate();
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.DELETE_FILE, async (_, { workspaceId, filePath }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
        throw new Error('Access denied: Path outside workspace');
    await electron_1.shell.trashItem(filePath);
    (0, search_1.getIndex)(workspace.path).invalidate();
    return { success: true };
});
// ── File management ──────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.RENAME_FILE, async (_, { workspaceId, filePath, newName }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    const res = await (0, file_ops_1.renameEntry)(workspace.path, filePath, newName);
    (0, search_1.getIndex)(workspace.path).invalidate();
    return res;
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.MOVE_FILE, async (_, { workspaceId, filePath, destDir }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    const res = await (0, file_ops_1.moveEntry)(workspace.path, filePath, destDir);
    (0, search_1.getIndex)(workspace.path).invalidate();
    return res;
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.COPY_FILE, async (_, { workspaceId, filePath, destDir }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    const res = await (0, file_ops_1.copyEntry)(workspace.path, filePath, destDir);
    (0, search_1.getIndex)(workspace.path).invalidate();
    return res;
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.CREATE_FILE, async (_, { workspaceId, dir, name }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    const res = await (0, file_ops_1.createExcalidrawFile)(workspace.path, dir ?? workspace.path, name);
    (0, search_1.getIndex)(workspace.path).invalidate();
    return res;
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.CREATE_FOLDER, async (_, { workspaceId, dir, name }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    return await (0, file_ops_1.createFolder)(workspace.path, dir ?? workspace.path, name);
});
// ── Search & tags ────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.SEARCH, async (_, { workspaceId, query }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    return await (0, search_1.getIndex)(workspace.path).search(query || '');
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.GET_TAGS, async (_, { workspaceId }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    return await (0, search_1.getIndex)(workspace.path).getTags();
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.SET_TAGS, async (_, { workspaceId, filePath, tags }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath))
        throw new Error('Access denied: Path outside workspace');
    return await (0, search_1.getIndex)(workspace.path).setTags(filePath, tags);
});
// ── Export (scene-embedded PNG / SVG / JSON) ─────────────────────────────
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.EXPORT_FILE, async (_, { workspaceId, filePath, format, data, scene }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    assertWritable(workspace, filePath);
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
    (0, search_1.getIndex)(workspace.path).invalidate();
    return { success: true, path: filePath };
});
// ── Plugins ──────────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.PLUGIN_CHANNELS.LIST, async () => {
    return shared_1.PluginListSchema.parse({ plugins: await pluginManager.list() });
});
electron_1.ipcMain.handle(ipc_1.PLUGIN_CHANNELS.GET_CONTRIBUTIONS, async () => {
    return await pluginManager.getContributions();
});
electron_1.ipcMain.handle(ipc_1.PLUGIN_CHANNELS.INSTALL_FROM_FOLDER, async (event) => {
    const result = await electron_1.dialog.showOpenDialog(electron_1.BrowserWindow.fromWebContents(event.sender), {
        properties: ['openDirectory'],
        title: 'Select a plugin folder (must contain plugin.json)',
    });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    return await pluginManager.installFromFolder(result.filePaths[0]);
});
electron_1.ipcMain.handle(ipc_1.PLUGIN_CHANNELS.ENABLE, async (_, { id }) => {
    await pluginManager.setEnabled(id, true);
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.PLUGIN_CHANNELS.DISABLE, async (_, { id }) => {
    await pluginManager.setEnabled(id, false);
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.PLUGIN_CHANNELS.UNINSTALL, async (_, { id }) => {
    await pluginManager.uninstall(id);
    return { success: true };
});
// ── AI Import ────────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.AI_CHANNELS.VALIDATE, async (_, { raw }) => {
    return (0, shared_1.validateRawPayload)(raw || '');
});
electron_1.ipcMain.handle(ipc_1.AI_CHANNELS.APPLY, async (_, { payload }) => {
    const parsed = shared_1.AiPayloadSchema.parse(payload);
    const active = await profileStore.getActive();
    if (!active)
        throw new Error('No active profile');
    const profileDir = profileStore.getProfileDir(active.id);
    return await (0, ai_import_1.applyAiPayload)(profileDir, parsed, (partial) => settingsStore.update(partial).then(() => { }));
});
// ── Templates ────────────────────────────────────────────────────────────
electron_1.ipcMain.handle(ipc_1.TEMPLATE_CHANNELS.LIST, async () => {
    return shared_1.TemplateListSchema.parse({ templates: await templateStore.list() });
});
electron_1.ipcMain.handle(ipc_1.TEMPLATE_CHANNELS.APPLY, async (_, { id }) => {
    return await templateStore.get(id);
});
electron_1.ipcMain.handle(ipc_1.TEMPLATE_CHANNELS.SAVE, async (_, input) => {
    return await templateStore.save(input);
});
electron_1.app.whenReady().then(async () => {
    await initStores();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});

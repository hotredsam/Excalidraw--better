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
let profileStore;
let settingsStore;
let workspaceStore;
async function initStores() {
    profileStore = new profile_1.ProfileStore();
    await profileStore.init();
    const activeProfile = await profileStore.getActive();
    if (activeProfile) {
        const profileDir = profileStore.getProfileDir(activeProfile.id);
        settingsStore = new settings_1.SettingsStore(profileDir);
        await settingsStore.init();
        workspaceStore = new workspace_1.WorkspaceStore(profileDir);
        await workspaceStore.init();
    }
}
function createWindow() {
    const isDev = process.env.NODE_ENV === 'development';
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
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
        // mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../../ui/dist/index.html'));
    }
    // Security: Deny navigation
    mainWindow.webContents.on('will-navigate', (event) => {
        event.preventDefault();
    });
    // Security: Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
// IPC Handlers
electron_1.ipcMain.handle(ipc_1.APP_CHANNELS.PING, async () => {
    const response = {
        ok: true,
        version: electron_1.app.getVersion(),
        platform: process.platform,
    };
    return shared_1.AppPingSchema.parse(response);
});
// Profiles
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.LIST, async () => {
    const profiles = await profileStore.list();
    return shared_1.ProfileListSchema.parse({ profiles });
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.GET_ACTIVE, async () => {
    const active = await profileStore.getActive();
    return active ? shared_1.ProfileSchema.parse(active) : null;
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.CREATE, async (_, { name }) => {
    const profile = await profileStore.create(name);
    return shared_1.ProfileSchema.parse(profile);
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.RENAME, async (_, { id, name }) => {
    const profile = await profileStore.rename(id, name);
    return shared_1.ProfileSchema.parse(profile);
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.DELETE, async (_, { id }) => {
    await profileStore.delete(id);
    // Re-init settings store for the new active profile
    const active = await profileStore.getActive();
    if (active) {
        settingsStore = new settings_1.SettingsStore(profileStore.getProfileDir(active.id));
        await settingsStore.init();
    }
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.PROFILE_CHANNELS.SET_ACTIVE, async (_, { id }) => {
    await profileStore.setActive(id);
    settingsStore = new settings_1.SettingsStore(profileStore.getProfileDir(id));
    await settingsStore.init();
    return { success: true };
});
// Settings
electron_1.ipcMain.handle(ipc_1.SETTINGS_CHANNELS.GET, async () => {
    return shared_1.SettingsSchema.parse(settingsStore.get());
});
electron_1.ipcMain.handle(ipc_1.SETTINGS_CHANNELS.UPDATE, async (_, partial) => {
    const settings = await settingsStore.update(partial);
    return shared_1.SettingsSchema.parse(settings);
});
// Workspaces
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.LIST, async () => {
    const workspaces = await workspaceStore.list();
    return shared_1.WorkspaceListSchema.parse({ workspaces });
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
    const name = path.basename(dirPath);
    const workspace = await workspaceStore.add(name, dirPath);
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
    const workspaces = await workspaceStore.list();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace)
        throw new Error('Workspace not found');
    const targetDir = path.join(workspace.path, subDir);
    const items = await fs.readdir(targetDir, { withFileTypes: true });
    const files = items.map(item => {
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
    }).filter(file => {
        if (file.isDirectory)
            return true;
        return ['.excalidraw', '.png', '.svg', '.json'].includes(file.extension || '');
    });
    return files;
});
const path_utils_1 = require("./path-utils");
const excalidraw_utils_1 = require("./excalidraw-utils");
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, async (_, { workspaceId, filePath }) => {
    const workspaces = await workspaceStore.list();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace)
        throw new Error('Workspace not found');
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath)) {
        throw new Error('Access denied: Path outside workspace');
    }
    return await (0, excalidraw_utils_1.readExcalidrawFile)(filePath);
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.READ_FILE, async (_, { workspaceId, filePath }) => {
    const workspaces = await workspaceStore.list();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace)
        throw new Error('Workspace not found');
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath)) {
        throw new Error('Access denied: Path outside workspace');
    }
    return await fs.readFile(filePath, 'utf-8');
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.WRITE_FILE, async (_, { workspaceId, filePath, content }) => {
    const workspaces = await workspaceStore.list();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace)
        throw new Error('Workspace not found');
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath)) {
        throw new Error('Access denied: Path outside workspace');
    }
    if ((0, path_utils_1.isDangerousPath)(filePath)) {
        throw new Error('Access denied: Dangerous path');
    }
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
});
electron_1.ipcMain.handle(ipc_1.WORKSPACE_CHANNELS.DELETE_FILE, async (_, { workspaceId, filePath }) => {
    const workspaces = await workspaceStore.list();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace)
        throw new Error('Workspace not found');
    if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath)) {
        throw new Error('Access denied: Path outside workspace');
    }
    await electron_1.shell.trashItem(filePath);
    return { success: true };
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

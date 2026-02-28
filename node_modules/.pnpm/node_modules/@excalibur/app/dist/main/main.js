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
const ipc_1 = require("@excalibur/ipc");
const shared_1 = require("@excalibur/shared");
const profile_1 = require("./profile");
const settings_1 = require("./settings");
let profileStore;
let settingsStore;
async function initStores() {
    profileStore = new profile_1.ProfileStore();
    await profileStore.init();
    const activeProfile = await profileStore.getActive();
    if (activeProfile) {
        settingsStore = new settings_1.SettingsStore(profileStore.getProfileDir(activeProfile.id));
        await settingsStore.init();
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

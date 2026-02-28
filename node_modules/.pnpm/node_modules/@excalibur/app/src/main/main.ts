import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import * as path from 'path';
import { APP_CHANNELS, PROFILE_CHANNELS, SETTINGS_CHANNELS, WORKSPACE_CHANNELS } from '@excalibur/ipc';
import { AppPingSchema, ProfileSchema, ProfileListSchema, SettingsSchema, WorkspaceSchema, WorkspaceListSchema } from '@excalibur/shared';
import { ProfileStore } from './profile';
import { SettingsStore } from './settings';
import { WorkspaceStore } from './workspace';

let profileStore: ProfileStore;
let settingsStore: SettingsStore;
let workspaceStore: WorkspaceStore;

async function initStores() {
  profileStore = new ProfileStore();
  await profileStore.init();
  
  const activeProfile = await profileStore.getActive();
  if (activeProfile) {
    const profileDir = profileStore.getProfileDir(activeProfile.id);
    settingsStore = new SettingsStore(profileDir);
    await settingsStore.init();
    
    workspaceStore = new WorkspaceStore(profileDir);
    await workspaceStore.init();
  }
}

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';

  const mainWindow = new BrowserWindow({
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
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../ui/dist/index.html'));
  }

  // Security: Deny navigation
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // Security: Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers
ipcMain.handle(APP_CHANNELS.PING, async () => {
  const response = {
    ok: true,
    version: app.getVersion(),
    platform: process.platform,
  };
  return AppPingSchema.parse(response);
});

// Profiles
ipcMain.handle(PROFILE_CHANNELS.LIST, async () => {
  const profiles = await profileStore.list();
  return ProfileListSchema.parse({ profiles });
});

ipcMain.handle(PROFILE_CHANNELS.GET_ACTIVE, async () => {
  const active = await profileStore.getActive();
  return active ? ProfileSchema.parse(active) : null;
});

ipcMain.handle(PROFILE_CHANNELS.CREATE, async (_, { name }) => {
  const profile = await profileStore.create(name);
  return ProfileSchema.parse(profile);
});

ipcMain.handle(PROFILE_CHANNELS.RENAME, async (_, { id, name }) => {
  const profile = await profileStore.rename(id, name);
  return ProfileSchema.parse(profile);
});

ipcMain.handle(PROFILE_CHANNELS.DELETE, async (_, { id }) => {
  await profileStore.delete(id);
  // Re-init settings store for the new active profile
  const active = await profileStore.getActive();
  if (active) {
    settingsStore = new SettingsStore(profileStore.getProfileDir(active.id));
    await settingsStore.init();
  }
  return { success: true };
});

ipcMain.handle(PROFILE_CHANNELS.SET_ACTIVE, async (_, { id }) => {
  await profileStore.setActive(id);
  settingsStore = new SettingsStore(profileStore.getProfileDir(id));
  await settingsStore.init();
  return { success: true };
});

// Settings
ipcMain.handle(SETTINGS_CHANNELS.GET, async () => {
  return SettingsSchema.parse(settingsStore.get());
});

ipcMain.handle(SETTINGS_CHANNELS.UPDATE, async (_, partial) => {
  const settings = await settingsStore.update(partial);
  return SettingsSchema.parse(settings);
});

// Workspaces
ipcMain.handle(WORKSPACE_CHANNELS.LIST, async () => {
  const workspaces = await workspaceStore.list();
  return WorkspaceListSchema.parse({ workspaces });
});

ipcMain.handle(WORKSPACE_CHANNELS.GET_ACTIVE, async () => {
  const active = await workspaceStore.getActive();
  return active ? WorkspaceSchema.parse(active) : null;
});

ipcMain.handle(WORKSPACE_CHANNELS.ADD, async (event) => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const dirPath = result.filePaths[0];
  const name = path.basename(dirPath);
  const workspace = await workspaceStore.add(name, dirPath);
  return WorkspaceSchema.parse(workspace);
});

ipcMain.handle(WORKSPACE_CHANNELS.SET_ACTIVE, async (_, { id }) => {
  await workspaceStore.setActive(id);
  return { success: true };
});

ipcMain.handle(WORKSPACE_CHANNELS.REMOVE, async (_, { id }) => {
  await workspaceStore.remove(id);
  return { success: true };
});

app.whenReady().then(async () => {
  await initStores();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

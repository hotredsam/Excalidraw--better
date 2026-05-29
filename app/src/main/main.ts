import { app, BrowserWindow, ipcMain, shell, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  APP_CHANNELS,
  PROFILE_CHANNELS,
  SETTINGS_CHANNELS,
  WORKSPACE_CHANNELS,
  PLUGIN_CHANNELS,
  AI_CHANNELS,
  TEMPLATE_CHANNELS,
  RECENT_CHANNELS,
  LIBRARY_CHANNELS,
  BULK_CHANNELS,
  PRESENTATION_CHANNELS,
  REVIEW_CHANNELS,
  STATS_CHANNELS,
  GIT_CHANNELS,
  COMMAND_CHANNELS,
  BACKUP_CHANNELS,
  MARKDOWN_CHANNELS,
  IMPORT_CHANNELS,
  SNIPPET_CHANNELS,
  SHORTCUT_CHANNELS,
} from '@excalibur/ipc';
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
  Workspace,
  RecentFileListSchema,
  LibraryListSchema,
  LibrarySchema,
  BulkRenameOptionsSchema,
  WorkspaceStatsSchema,
  MarkdownOptionsSchema,
} from '@excalibur/shared';
import { ProfileStore } from './profile';
import { SettingsStore } from './settings';
import { WorkspaceStore } from './workspace';
import { PluginManager } from './plugins';
import { TemplateStore } from './templates';
import { RecentsStore } from './recents';
import { LibraryStore } from './libraries';
import { BackupManager } from './backup';
import { ReviewStore } from './review';
import { GitHelper } from './git-helper';
import { computeStats } from './stats';
import { getDeck, setSlideNotes } from './presentation';
import { writeMarkdownBundle } from './markdown';
import { buildImageInsertion } from './import-pack';
import { bulkRename, bulkDelete, bulkMove } from './bulk-ops';
import { buildCommandList } from './command-registry';
import { SnippetStore } from './snippets';
import { ShortcutStore } from './shortcuts';
import { parseSvgToElements } from './svg-import';
import { isPathWithin, isDangerousPath } from './path-utils';
import { readExcalidrawFile } from './excalidraw-utils';
import { getIndex } from './search';
import { embedSceneInPng, embedSceneInSvg, dataUrlToBuffer } from './export-utils';
import { renameEntry, moveEntry, copyEntry, createExcalidrawFile, createFolder } from './file-ops';
import { applyAiPayload } from './ai-import';

let profileStore: ProfileStore;
let settingsStore: SettingsStore;
let workspaceStore: WorkspaceStore;
let pluginManager: PluginManager;
let templateStore: TemplateStore;
let recentsStore: RecentsStore;
let libraryStore: LibraryStore;
let backupManager: BackupManager;
let snippetStore: SnippetStore;
let shortcutStore: ShortcutStore;

function builtinPluginsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'plugins')
    : path.join(__dirname, '../../../plugins');
}

async function bindProfile(profileId: string) {
  const profileDir = profileStore.getProfileDir(profileId);
  settingsStore = new SettingsStore(profileDir);
  await settingsStore.init();
  workspaceStore = new WorkspaceStore(profileDir);
  await workspaceStore.init();
  pluginManager = new PluginManager(profileDir, builtinPluginsDir());
  await pluginManager.init();
  templateStore = new TemplateStore(profileDir);
  await templateStore.init();

  const settings = settingsStore.get();
  recentsStore = new RecentsStore(profileDir, settings.recentsLimit);
  await recentsStore.init();
  recentsStore.setLimit(settings.recentsLimit);
  libraryStore = new LibraryStore(profileDir);
  await libraryStore.init();
  backupManager = new BackupManager(profileDir, settings.backupsToKeep);
  await backupManager.init();
  snippetStore = new SnippetStore(profileDir);
  await snippetStore.init();
  shortcutStore = new ShortcutStore(profileDir);
  await shortcutStore.init();
}

async function initStores() {
  profileStore = new ProfileStore();
  await profileStore.init();
  const activeProfile = await profileStore.getActive();
  if (activeProfile) {
    await bindProfile(activeProfile.id);
  }
}

async function getWorkspaceOrThrow(workspaceId: string): Promise<Workspace> {
  const workspaces = await workspaceStore.list();
  const workspace = workspaces.find((w) => w.id === workspaceId);
  if (!workspace) throw new Error('Workspace not found');
  return workspace;
}

function assertWritable(workspace: Workspace, filePath: string) {
  if (!isPathWithin(workspace.path, filePath)) {
    throw new Error('Access denied: Path outside workspace');
  }
  if (isDangerousPath(filePath)) {
    throw new Error('Access denied: Dangerous path');
  }
}

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';

  const mainWindow = new BrowserWindow({
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
  } else if (app.isPackaged) {
    // Renderer is bundled into resources/ui via electron-builder extraResources.
    mainWindow.loadFile(path.join(process.resourcesPath, 'ui', 'index.html'));
  } else {
    // Running the compiled build locally against the monorepo's ui/dist.
    mainWindow.loadFile(path.join(__dirname, '../../../ui/dist/index.html'));
  }

  // Security: deny in-app navigation and route external links to the OS browser.
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  buildMenu(mainWindow);
}

/**
 * Native application menu with the spec'd keyboard accelerators. Each item
 * forwards a lightweight `menu:command` event to the renderer, which performs
 * the action against the active canvas.
 */
function buildMenu(win: BrowserWindow) {
  const send = (cmd: string) => win.webContents.send('menu:command', cmd);
  const template: Electron.MenuItemConstructorOptions[] = [
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
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── App ──────────────────────────────────────────────────────────────────
ipcMain.handle(APP_CHANNELS.PING, async () => {
  return AppPingSchema.parse({ ok: true, version: app.getVersion(), platform: process.platform });
});

// ── Profiles ─────────────────────────────────────────────────────────────
ipcMain.handle(PROFILE_CHANNELS.LIST, async () => {
  return ProfileListSchema.parse({ profiles: await profileStore.list() });
});
ipcMain.handle(PROFILE_CHANNELS.GET_ACTIVE, async () => {
  const active = await profileStore.getActive();
  return active ? ProfileSchema.parse(active) : null;
});
ipcMain.handle(PROFILE_CHANNELS.CREATE, async (_, { name }) => {
  return ProfileSchema.parse(await profileStore.create(name));
});
ipcMain.handle(PROFILE_CHANNELS.RENAME, async (_, { id, name }) => {
  return ProfileSchema.parse(await profileStore.rename(id, name));
});
ipcMain.handle(PROFILE_CHANNELS.DELETE, async (_, { id }) => {
  await profileStore.delete(id);
  const active = await profileStore.getActive();
  if (active) await bindProfile(active.id);
  return { success: true };
});
ipcMain.handle(PROFILE_CHANNELS.SET_ACTIVE, async (_, { id }) => {
  await profileStore.setActive(id);
  await bindProfile(id);
  return { success: true };
});

// ── Settings ─────────────────────────────────────────────────────────────
ipcMain.handle(SETTINGS_CHANNELS.GET, async () => SettingsSchema.parse(settingsStore.get()));
ipcMain.handle(SETTINGS_CHANNELS.UPDATE, async (_, partial) => {
  return SettingsSchema.parse(await settingsStore.update(partial));
});

// ── Workspaces ───────────────────────────────────────────────────────────
ipcMain.handle(WORKSPACE_CHANNELS.LIST, async () => {
  return WorkspaceListSchema.parse({ workspaces: await workspaceStore.list() });
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
  const workspace = await workspaceStore.add(path.basename(dirPath), dirPath);
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

ipcMain.handle(WORKSPACE_CHANNELS.LIST_FILES, async (_, { workspaceId, subDir = '' }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const targetDir = path.join(workspace.path, subDir);
  if (!isPathWithin(workspace.path, targetDir) && path.resolve(targetDir) !== path.resolve(workspace.path)) {
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
});

ipcMain.handle(WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, async (_, { workspaceId, filePath }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
  return await readExcalidrawFile(filePath);
});

ipcMain.handle(WORKSPACE_CHANNELS.READ_FILE, async (_, { workspaceId, filePath }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
  return await fs.readFile(filePath, 'utf-8');
});

ipcMain.handle(WORKSPACE_CHANNELS.WRITE_FILE, async (_, { workspaceId, filePath, content }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  assertWritable(workspace, filePath);
  // Snapshot the previous version before overwriting (if backups are enabled).
  if (settingsStore.get().keepBackups) {
    await backupManager.backup(filePath).catch(() => undefined);
  }
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
  getIndex(workspace.path).invalidate();
  return { success: true };
});

ipcMain.handle(WORKSPACE_CHANNELS.WRITE_BINARY_FILE, async (_, { workspaceId, filePath, base64 }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  assertWritable(workspace, filePath);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, dataUrlToBuffer(base64));
  getIndex(workspace.path).invalidate();
  return { success: true };
});

ipcMain.handle(WORKSPACE_CHANNELS.DELETE_FILE, async (_, { workspaceId, filePath }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
  await shell.trashItem(filePath);
  getIndex(workspace.path).invalidate();
  return { success: true };
});

// ── File management ──────────────────────────────────────────────────────
ipcMain.handle(WORKSPACE_CHANNELS.RENAME_FILE, async (_, { workspaceId, filePath, newName }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await renameEntry(workspace.path, filePath, newName);
  getIndex(workspace.path).invalidate();
  return res;
});
ipcMain.handle(WORKSPACE_CHANNELS.MOVE_FILE, async (_, { workspaceId, filePath, destDir }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await moveEntry(workspace.path, filePath, destDir);
  getIndex(workspace.path).invalidate();
  return res;
});
ipcMain.handle(WORKSPACE_CHANNELS.COPY_FILE, async (_, { workspaceId, filePath, destDir }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await copyEntry(workspace.path, filePath, destDir);
  getIndex(workspace.path).invalidate();
  return res;
});
ipcMain.handle(WORKSPACE_CHANNELS.CREATE_FILE, async (_, { workspaceId, dir, name }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await createExcalidrawFile(workspace.path, dir ?? workspace.path, name);
  getIndex(workspace.path).invalidate();
  return res;
});
ipcMain.handle(WORKSPACE_CHANNELS.CREATE_FOLDER, async (_, { workspaceId, dir, name }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  return await createFolder(workspace.path, dir ?? workspace.path, name);
});

// ── Search & tags ────────────────────────────────────────────────────────
ipcMain.handle(WORKSPACE_CHANNELS.SEARCH, async (_, { workspaceId, query }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  return await getIndex(workspace.path).search(query || '');
});
ipcMain.handle(WORKSPACE_CHANNELS.GET_TAGS, async (_, { workspaceId }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  return await getIndex(workspace.path).getTags();
});
ipcMain.handle(WORKSPACE_CHANNELS.SET_TAGS, async (_, { workspaceId, filePath, tags }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  if (!isPathWithin(workspace.path, filePath)) throw new Error('Access denied: Path outside workspace');
  return await getIndex(workspace.path).setTags(filePath, tags);
});

// ── Export (scene-embedded PNG / SVG / JSON) ─────────────────────────────
ipcMain.handle(
  WORKSPACE_CHANNELS.EXPORT_FILE,
  async (_, { workspaceId, filePath, format, data, scene }) => {
    const workspace = await getWorkspaceOrThrow(workspaceId);
    assertWritable(workspace, filePath);
    await fs.ensureDir(path.dirname(filePath));
    if (format === 'png') {
      await fs.writeFile(filePath, embedSceneInPng(dataUrlToBuffer(data), scene));
    } else if (format === 'svg') {
      await fs.writeFile(filePath, embedSceneInSvg(data, scene), 'utf-8');
    } else {
      await fs.writeFile(filePath, JSON.stringify(scene, null, 2), 'utf-8');
    }
    getIndex(workspace.path).invalidate();
    return { success: true, path: filePath };
  },
);

// ── Plugins ──────────────────────────────────────────────────────────────
ipcMain.handle(PLUGIN_CHANNELS.LIST, async () => {
  return PluginListSchema.parse({ plugins: await pluginManager.list() });
});
ipcMain.handle(PLUGIN_CHANNELS.GET_CONTRIBUTIONS, async () => {
  return await pluginManager.getContributions();
});
ipcMain.handle(PLUGIN_CHANNELS.INSTALL_FROM_FOLDER, async (event) => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, {
    properties: ['openDirectory'],
    title: 'Select a plugin folder (must contain plugin.json)',
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return await pluginManager.installFromFolder(result.filePaths[0]);
});
ipcMain.handle(PLUGIN_CHANNELS.ENABLE, async (_, { id }) => {
  await pluginManager.setEnabled(id, true);
  return { success: true };
});
ipcMain.handle(PLUGIN_CHANNELS.DISABLE, async (_, { id }) => {
  await pluginManager.setEnabled(id, false);
  return { success: true };
});
ipcMain.handle(PLUGIN_CHANNELS.UNINSTALL, async (_, { id }) => {
  await pluginManager.uninstall(id);
  return { success: true };
});

// ── AI Import ────────────────────────────────────────────────────────────
ipcMain.handle(AI_CHANNELS.VALIDATE, async (_, { raw }) => {
  return validateRawPayload(raw || '');
});
ipcMain.handle(AI_CHANNELS.APPLY, async (_, { payload }) => {
  const parsed = AiPayloadSchema.parse(payload);
  const active = await profileStore.getActive();
  if (!active) throw new Error('No active profile');
  const profileDir = profileStore.getProfileDir(active.id);
  return await applyAiPayload(profileDir, parsed, (partial) => settingsStore.update(partial).then(() => {}));
});

// ── Templates ────────────────────────────────────────────────────────────
ipcMain.handle(TEMPLATE_CHANNELS.LIST, async () => {
  return TemplateListSchema.parse({ templates: await templateStore.list() });
});
ipcMain.handle(TEMPLATE_CHANNELS.APPLY, async (_, { id }) => {
  return await templateStore.get(id);
});
ipcMain.handle(TEMPLATE_CHANNELS.SAVE, async (_, input) => {
  return await templateStore.save(input);
});

// ── Recent files ─────────────────────────────────────────────────────────
ipcMain.handle(RECENT_CHANNELS.LIST, async () => {
  return RecentFileListSchema.parse({ recents: await recentsStore.prune() });
});
ipcMain.handle(RECENT_CHANNELS.ADD, async (_, entry) => {
  return RecentFileListSchema.parse({ recents: await recentsStore.add(entry) });
});
ipcMain.handle(RECENT_CHANNELS.REMOVE, async (_, { path: p }) => {
  return RecentFileListSchema.parse({ recents: await recentsStore.remove(p) });
});
ipcMain.handle(RECENT_CHANNELS.CLEAR, async () => {
  await recentsStore.clear();
  return { success: true };
});

// ── Libraries ──────────────────────────────────────────────────────────────
ipcMain.handle(LIBRARY_CHANNELS.LIST, async () => {
  return LibraryListSchema.parse({ libraries: await libraryStore.list() });
});
ipcMain.handle(LIBRARY_CHANNELS.GET, async (_, { id }) => {
  return LibrarySchema.parse(await libraryStore.get(id));
});
ipcMain.handle(LIBRARY_CHANNELS.IMPORT, async (event) => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, {
    properties: ['openFile'],
    filters: [{ name: 'Excalidraw Library', extensions: ['excalidrawlib', 'json'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return await libraryStore.importFromFile(result.filePaths[0]);
});
ipcMain.handle(LIBRARY_CHANNELS.ADD_ITEMS, async (_, { id, items }) => {
  return await libraryStore.addItems(id, items);
});
ipcMain.handle(LIBRARY_CHANNELS.REMOVE, async (_, { id }) => {
  await libraryStore.remove(id);
  return { success: true };
});
ipcMain.handle(LIBRARY_CHANNELS.EXPORT, async (_, { id }) => {
  return { json: await libraryStore.exportJson(id) };
});

// ── Bulk operations ──────────────────────────────────────────────────────
ipcMain.handle(BULK_CHANNELS.RENAME, async (_, { workspaceId, files, options }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await bulkRename(workspace.path, files, BulkRenameOptionsSchema.parse(options));
  getIndex(workspace.path).invalidate();
  return res;
});
ipcMain.handle(BULK_CHANNELS.DELETE, async (_, { workspaceId, files }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await bulkDelete(workspace.path, files, (p) => shell.trashItem(p));
  getIndex(workspace.path).invalidate();
  return res;
});
ipcMain.handle(BULK_CHANNELS.MOVE, async (_, { workspaceId, files, destDir }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const res = await bulkMove(workspace.path, files, destDir);
  getIndex(workspace.path).invalidate();
  return res;
});

// ── Presentation ─────────────────────────────────────────────────────────
ipcMain.handle(PRESENTATION_CHANNELS.GET_DECK, async (_, { workspaceId, filePath, scene }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const rel = isPathWithin(workspace.path, filePath) ? path.relative(workspace.path, filePath) : 'scratch';
  return await getDeck(workspace.path, rel, scene);
});
ipcMain.handle(PRESENTATION_CHANNELS.SET_NOTES, async (_, { workspaceId, filePath, slideId, notes }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const rel = isPathWithin(workspace.path, filePath) ? path.relative(workspace.path, filePath) : 'scratch';
  await setSlideNotes(workspace.path, rel, slideId, notes);
  return { success: true };
});

// ── Review (comment pins) ──────────────────────────────────────────────────
function reviewStore(workspace: Workspace) {
  return new ReviewStore(workspace.path);
}
ipcMain.handle(REVIEW_CHANNELS.GET, async (_, { workspaceId, filePath }) => {
  return await reviewStore(await getWorkspaceOrThrow(workspaceId)).get(filePath);
});
ipcMain.handle(REVIEW_CHANNELS.ADD_PIN, async (_, { workspaceId, filePath, x, y, author, body }) => {
  return await reviewStore(await getWorkspaceOrThrow(workspaceId)).addPin(filePath, x, y, author, body);
});
ipcMain.handle(REVIEW_CHANNELS.ADD_COMMENT, async (_, { workspaceId, filePath, pinId, author, body }) => {
  return await reviewStore(await getWorkspaceOrThrow(workspaceId)).addComment(filePath, pinId, author, body);
});
ipcMain.handle(REVIEW_CHANNELS.SET_RESOLVED, async (_, { workspaceId, filePath, pinId, resolved }) => {
  return await reviewStore(await getWorkspaceOrThrow(workspaceId)).setResolved(filePath, pinId, resolved);
});
ipcMain.handle(REVIEW_CHANNELS.DELETE_PIN, async (_, { workspaceId, filePath, pinId }) => {
  return await reviewStore(await getWorkspaceOrThrow(workspaceId)).deletePin(filePath, pinId);
});

// ── Workspace stats ──────────────────────────────────────────────────────
ipcMain.handle(STATS_CHANNELS.COMPUTE, async (_, { workspaceId }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const tags = await getIndex(workspace.path).getTags();
  return WorkspaceStatsSchema.parse(await computeStats(workspace.path, tags));
});

// ── Git helper ─────────────────────────────────────────────────────────────
function gitFor(workspace: Workspace) {
  return new GitHelper(workspace.path);
}
ipcMain.handle(GIT_CHANNELS.STATUS, async (_, { workspaceId }) => {
  return await gitFor(await getWorkspaceOrThrow(workspaceId)).status();
});
ipcMain.handle(GIT_CHANNELS.COMMIT, async (_, { workspaceId, message, files }) => {
  return { output: await gitFor(await getWorkspaceOrThrow(workspaceId)).commit(message, files) };
});
ipcMain.handle(GIT_CHANNELS.LOG, async (_, { workspaceId, limit }) => {
  return { entries: await gitFor(await getWorkspaceOrThrow(workspaceId)).log(limit) };
});
ipcMain.handle(GIT_CHANNELS.INIT, async (_, { workspaceId }) => {
  await gitFor(await getWorkspaceOrThrow(workspaceId)).init();
  return { success: true };
});

// ── Command palette ──────────────────────────────────────────────────────
ipcMain.handle(COMMAND_CHANNELS.LIST, async () => {
  const contributions = await pluginManager.getContributions();
  return { commands: buildCommandList(contributions) };
});

// ── Backups ────────────────────────────────────────────────────────────────
ipcMain.handle(BACKUP_CHANNELS.LIST, async (_, { originalPath }) => {
  return { backups: backupManager.list(originalPath) };
});
ipcMain.handle(BACKUP_CHANNELS.RESTORE, async (_, { id, destPath }) => {
  return { path: await backupManager.restore(id, destPath) };
});

// ── Markdown export ────────────────────────────────────────────────────────
ipcMain.handle(MARKDOWN_CHANNELS.EXPORT, async (_, { workspaceId, baseName, options, imageData, scene, bodyText }) => {
  const workspace = await getWorkspaceOrThrow(workspaceId);
  const bundle = await writeMarkdownBundle(
    workspace.path,
    baseName,
    MarkdownOptionsSchema.parse(options),
    imageData,
    scene,
    bodyText || '',
  );
  getIndex(workspace.path).invalidate();
  return bundle;
});

// ── Import image ─────────────────────────────────────────────────────────
ipcMain.handle(IMPORT_CHANNELS.PICK_IMAGE, async (event) => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return await buildImageInsertion(result.filePaths[0]);
});

ipcMain.handle(IMPORT_CHANNELS.PICK_SVG_AS_ELEMENTS, async (event) => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, {
    properties: ['openFile'],
    filters: [{ name: 'SVG', extensions: ['svg'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const svg = await fs.readFile(result.filePaths[0], 'utf-8');
  return parseSvgToElements(svg);
});

// ── Snippets ─────────────────────────────────────────────────────────────
ipcMain.handle(SNIPPET_CHANNELS.LIST, async () => {
  return { snippets: await snippetStore.list() };
});
ipcMain.handle(SNIPPET_CHANNELS.GET, async (_, { id }) => {
  return await snippetStore.get(id);
});
ipcMain.handle(SNIPPET_CHANNELS.SAVE, async (_, input) => {
  return await snippetStore.save(input);
});
ipcMain.handle(SNIPPET_CHANNELS.REMOVE, async (_, { id }) => {
  await snippetStore.remove(id);
  return { success: true };
});
ipcMain.handle(SNIPPET_CHANNELS.RENAME, async (_, { id, title }) => {
  return await snippetStore.rename(id, title);
});

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
ipcMain.handle(SHORTCUT_CHANNELS.LIST, async () => {
  return { bindings: shortcutStore.list() };
});
ipcMain.handle(SHORTCUT_CHANNELS.SET, async (_, { commandId, accelerator, force }) => {
  return { bindings: await shortcutStore.set(commandId, accelerator, force) };
});
ipcMain.handle(SHORTCUT_CHANNELS.RESET, async (_, { commandId }) => {
  return { bindings: await shortcutStore.reset(commandId) };
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

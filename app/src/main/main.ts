import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import * as path from 'path';
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
  WORKSPACE_CONFIG_CHANNELS,
  STYLE_CHANNELS,
} from '@excalibur/ipc';
import { ExcaliburEngine, createApiHandlers, type ExcaliburApi } from '@excalibur/core';
import { createElectronHost } from './electron-host';

// The engine + its API surface are created once the app is ready. All the
// operation logic lives in @excalibur/core; this file is the Electron transport
// adapter — it wires IPC channels to API methods and owns the window/menu.
let api: ExcaliburApi;

/**
 * Map every IPC channel onto its API method, unwrapping the renderer's payload
 * objects into positional arguments. This is the only place that knows about
 * the IPC wire shape; the handlers themselves are transport-agnostic.
 */
function registerIpc(a: ExcaliburApi) {
  ipcMain.handle(APP_CHANNELS.PING, () => a.app.ping());

  ipcMain.handle(PROFILE_CHANNELS.LIST, () => a.profiles.list());
  ipcMain.handle(PROFILE_CHANNELS.GET_ACTIVE, () => a.profiles.getActive());
  ipcMain.handle(PROFILE_CHANNELS.CREATE, (_, { name }) => a.profiles.create(name));
  ipcMain.handle(PROFILE_CHANNELS.RENAME, (_, { id, name }) => a.profiles.rename(id, name));
  ipcMain.handle(PROFILE_CHANNELS.DELETE, (_, { id }) => a.profiles.delete(id));
  ipcMain.handle(PROFILE_CHANNELS.SET_ACTIVE, (_, { id }) => a.profiles.setActive(id));

  ipcMain.handle(SETTINGS_CHANNELS.GET, () => a.settings.get());
  ipcMain.handle(SETTINGS_CHANNELS.UPDATE, (_, partial) => a.settings.update(partial));

  ipcMain.handle(WORKSPACE_CHANNELS.LIST, () => a.workspaces.list());
  ipcMain.handle(WORKSPACE_CHANNELS.GET_ACTIVE, () => a.workspaces.getActive());
  ipcMain.handle(WORKSPACE_CHANNELS.ADD, () => a.workspaces.add());
  ipcMain.handle(WORKSPACE_CHANNELS.SET_ACTIVE, (_, { id }) => a.workspaces.setActive(id));
  ipcMain.handle(WORKSPACE_CHANNELS.REMOVE, (_, { id }) => a.workspaces.remove(id));
  ipcMain.handle(WORKSPACE_CHANNELS.LIST_FILES, (_, { workspaceId, subDir }) =>
    a.workspaces.listFiles(workspaceId, subDir),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, (_, { workspaceId, filePath }) =>
    a.workspaces.readExcalidrawFile(workspaceId, filePath),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.READ_FILE, (_, { workspaceId, filePath }) =>
    a.workspaces.readFile(workspaceId, filePath),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.WRITE_FILE, (_, { workspaceId, filePath, content }) =>
    a.workspaces.writeFile(workspaceId, filePath, content),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.WRITE_BINARY_FILE, (_, { workspaceId, filePath, base64 }) =>
    a.workspaces.writeBinaryFile(workspaceId, filePath, base64),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.DELETE_FILE, (_, { workspaceId, filePath }) =>
    a.workspaces.deleteFile(workspaceId, filePath),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.RENAME_FILE, (_, { workspaceId, filePath, newName }) =>
    a.workspaces.renameFile(workspaceId, filePath, newName),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.MOVE_FILE, (_, { workspaceId, filePath, destDir }) =>
    a.workspaces.moveFile(workspaceId, filePath, destDir),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.COPY_FILE, (_, { workspaceId, filePath, destDir }) =>
    a.workspaces.copyFile(workspaceId, filePath, destDir),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.CREATE_FILE, (_, { workspaceId, dir, name }) =>
    a.workspaces.createFile(workspaceId, dir, name),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.CREATE_FOLDER, (_, { workspaceId, dir, name }) =>
    a.workspaces.createFolder(workspaceId, dir, name),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.SEARCH, (_, { workspaceId, query }) =>
    a.workspaces.search(workspaceId, query),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.GET_TAGS, (_, { workspaceId }) => a.workspaces.getTags(workspaceId));
  ipcMain.handle(WORKSPACE_CHANNELS.SET_TAGS, (_, { workspaceId, filePath, tags }) =>
    a.workspaces.setTags(workspaceId, filePath, tags),
  );
  ipcMain.handle(WORKSPACE_CHANNELS.EXPORT_FILE, (_, { workspaceId, filePath, format, data, scene }) =>
    a.workspaces.exportFile(workspaceId, filePath, format, data, scene),
  );

  ipcMain.handle(PLUGIN_CHANNELS.LIST, () => a.plugins.list());
  ipcMain.handle(PLUGIN_CHANNELS.GET_CONTRIBUTIONS, () => a.plugins.getContributions());
  ipcMain.handle(PLUGIN_CHANNELS.INSTALL_FROM_FOLDER, () => a.plugins.installFromFolder());
  ipcMain.handle(PLUGIN_CHANNELS.ENABLE, (_, { id }) => a.plugins.enable(id));
  ipcMain.handle(PLUGIN_CHANNELS.DISABLE, (_, { id }) => a.plugins.disable(id));
  ipcMain.handle(PLUGIN_CHANNELS.UNINSTALL, (_, { id }) => a.plugins.uninstall(id));

  ipcMain.handle(AI_CHANNELS.VALIDATE, (_, { raw }) => a.ai.validate(raw));
  ipcMain.handle(AI_CHANNELS.APPLY, (_, { payload }) => a.ai.apply(payload));

  ipcMain.handle(TEMPLATE_CHANNELS.LIST, () => a.templates.list());
  ipcMain.handle(TEMPLATE_CHANNELS.APPLY, (_, { id }) => a.templates.apply(id));
  ipcMain.handle(TEMPLATE_CHANNELS.SAVE, (_, input) => a.templates.save(input));

  ipcMain.handle(RECENT_CHANNELS.LIST, () => a.recents.list());
  ipcMain.handle(RECENT_CHANNELS.ADD, (_, entry) => a.recents.add(entry));
  ipcMain.handle(RECENT_CHANNELS.REMOVE, (_, { path: p }) => a.recents.remove(p));
  ipcMain.handle(RECENT_CHANNELS.CLEAR, () => a.recents.clear());

  ipcMain.handle(LIBRARY_CHANNELS.LIST, () => a.libraries.list());
  ipcMain.handle(LIBRARY_CHANNELS.GET, (_, { id }) => a.libraries.get(id));
  ipcMain.handle(LIBRARY_CHANNELS.IMPORT, () => a.libraries.import());
  ipcMain.handle(LIBRARY_CHANNELS.ADD_ITEMS, (_, { id, items }) => a.libraries.addItems(id, items));
  ipcMain.handle(LIBRARY_CHANNELS.REMOVE, (_, { id }) => a.libraries.remove(id));
  ipcMain.handle(LIBRARY_CHANNELS.EXPORT, (_, { id }) => a.libraries.export(id));

  ipcMain.handle(BULK_CHANNELS.RENAME, (_, { workspaceId, files, options }) =>
    a.bulk.rename(workspaceId, files, options),
  );
  ipcMain.handle(BULK_CHANNELS.DELETE, (_, { workspaceId, files }) => a.bulk.delete(workspaceId, files));
  ipcMain.handle(BULK_CHANNELS.MOVE, (_, { workspaceId, files, destDir }) =>
    a.bulk.move(workspaceId, files, destDir),
  );

  ipcMain.handle(PRESENTATION_CHANNELS.GET_DECK, (_, { workspaceId, filePath, scene }) =>
    a.presentation.getDeck(workspaceId, filePath, scene),
  );
  ipcMain.handle(PRESENTATION_CHANNELS.SET_NOTES, (_, { workspaceId, filePath, slideId, notes }) =>
    a.presentation.setNotes(workspaceId, filePath, slideId, notes),
  );

  ipcMain.handle(REVIEW_CHANNELS.GET, (_, { workspaceId, filePath }) =>
    a.review.get(workspaceId, filePath),
  );
  ipcMain.handle(REVIEW_CHANNELS.ADD_PIN, (_, { workspaceId, filePath, x, y, author, body }) =>
    a.review.addPin(workspaceId, filePath, x, y, author, body),
  );
  ipcMain.handle(REVIEW_CHANNELS.ADD_COMMENT, (_, { workspaceId, filePath, pinId, author, body }) =>
    a.review.addComment(workspaceId, filePath, pinId, author, body),
  );
  ipcMain.handle(REVIEW_CHANNELS.SET_RESOLVED, (_, { workspaceId, filePath, pinId, resolved }) =>
    a.review.setResolved(workspaceId, filePath, pinId, resolved),
  );
  ipcMain.handle(REVIEW_CHANNELS.DELETE_PIN, (_, { workspaceId, filePath, pinId }) =>
    a.review.deletePin(workspaceId, filePath, pinId),
  );

  ipcMain.handle(STATS_CHANNELS.COMPUTE, (_, { workspaceId }) => a.stats.compute(workspaceId));

  ipcMain.handle(GIT_CHANNELS.STATUS, (_, { workspaceId }) => a.git.status(workspaceId));
  ipcMain.handle(GIT_CHANNELS.COMMIT, (_, { workspaceId, message, files }) =>
    a.git.commit(workspaceId, message, files),
  );
  ipcMain.handle(GIT_CHANNELS.LOG, (_, { workspaceId, limit }) => a.git.log(workspaceId, limit));
  ipcMain.handle(GIT_CHANNELS.INIT, (_, { workspaceId }) => a.git.init(workspaceId));

  ipcMain.handle(COMMAND_CHANNELS.LIST, () => a.commands.list());

  ipcMain.handle(BACKUP_CHANNELS.LIST, (_, { originalPath }) => a.backups.list(originalPath));
  ipcMain.handle(BACKUP_CHANNELS.RESTORE, (_, { id, destPath }) => a.backups.restore(id, destPath));

  ipcMain.handle(MARKDOWN_CHANNELS.EXPORT, (_, { workspaceId, baseName, options, imageData, scene, bodyText }) =>
    a.markdown.export(workspaceId, baseName, options, imageData, scene, bodyText),
  );

  ipcMain.handle(IMPORT_CHANNELS.PICK_IMAGE, () => a.import.pickImage());
  ipcMain.handle(IMPORT_CHANNELS.PICK_SVG_AS_ELEMENTS, () => a.import.pickSvgAsElements());

  ipcMain.handle(SNIPPET_CHANNELS.LIST, () => a.snippets.list());
  ipcMain.handle(SNIPPET_CHANNELS.GET, (_, { id }) => a.snippets.get(id));
  ipcMain.handle(SNIPPET_CHANNELS.SAVE, (_, input) => a.snippets.save(input));
  ipcMain.handle(SNIPPET_CHANNELS.REMOVE, (_, { id }) => a.snippets.remove(id));
  ipcMain.handle(SNIPPET_CHANNELS.RENAME, (_, { id, title }) => a.snippets.rename(id, title));

  ipcMain.handle(SHORTCUT_CHANNELS.LIST, () => a.shortcuts.list());
  ipcMain.handle(SHORTCUT_CHANNELS.SET, (_, { commandId, accelerator, force }) =>
    a.shortcuts.set(commandId, accelerator, force),
  );
  ipcMain.handle(SHORTCUT_CHANNELS.RESET, (_, { commandId }) => a.shortcuts.reset(commandId));

  ipcMain.handle(WORKSPACE_CONFIG_CHANNELS.GET, (_, { workspaceId }) => a.workspaceConfig.get(workspaceId));
  ipcMain.handle(WORKSPACE_CONFIG_CHANNELS.UPDATE, (_, { workspaceId, partial }) =>
    a.workspaceConfig.update(workspaceId, partial),
  );

  ipcMain.handle(STYLE_CHANNELS.LIST, () => a.styles.list());
  ipcMain.handle(STYLE_CHANNELS.SAVE, (_, input) => a.styles.save(input));
  ipcMain.handle(STYLE_CHANNELS.REMOVE, (_, { id }) => a.styles.remove(id));
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

app.whenReady().then(async () => {
  const engine = new ExcaliburEngine(createElectronHost());
  await engine.init();
  api = createApiHandlers(engine);
  registerIpc(api);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

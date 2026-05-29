import { contextBridge, ipcRenderer } from 'electron';
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
} from '@excalibur/ipc';

contextBridge.exposeInMainWorld('api', {
  app: {
    ping: () => ipcRenderer.invoke(APP_CHANNELS.PING),
  },
  profiles: {
    list: () => ipcRenderer.invoke(PROFILE_CHANNELS.LIST),
    getActive: () => ipcRenderer.invoke(PROFILE_CHANNELS.GET_ACTIVE),
    setActive: (id: string) => ipcRenderer.invoke(PROFILE_CHANNELS.SET_ACTIVE, { id }),
    create: (name: string) => ipcRenderer.invoke(PROFILE_CHANNELS.CREATE, { name }),
    rename: (id: string, name: string) => ipcRenderer.invoke(PROFILE_CHANNELS.RENAME, { id, name }),
    delete: (id: string) => ipcRenderer.invoke(PROFILE_CHANNELS.DELETE, { id }),
  },
  settings: {
    get: () => ipcRenderer.invoke(SETTINGS_CHANNELS.GET),
    update: (partial: any) => ipcRenderer.invoke(SETTINGS_CHANNELS.UPDATE, partial),
  },
  workspaces: {
    list: () => ipcRenderer.invoke(WORKSPACE_CHANNELS.LIST),
    add: () => ipcRenderer.invoke(WORKSPACE_CHANNELS.ADD),
    remove: (id: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.REMOVE, { id }),
    setActive: (id: string | null) => ipcRenderer.invoke(WORKSPACE_CHANNELS.SET_ACTIVE, { id }),
    getActive: () => ipcRenderer.invoke(WORKSPACE_CHANNELS.GET_ACTIVE),
    listFiles: (workspaceId: string, subDir?: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.LIST_FILES, { workspaceId, subDir }),
    readFile: (workspaceId: string, filePath: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.READ_FILE, { workspaceId, filePath }),
    readExcalidrawFile: (workspaceId: string, filePath: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, { workspaceId, filePath }),
    writeFile: (workspaceId: string, filePath: string, content: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.WRITE_FILE, { workspaceId, filePath, content }),
    writeBinaryFile: (workspaceId: string, filePath: string, base64: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.WRITE_BINARY_FILE, { workspaceId, filePath, base64 }),
    deleteFile: (workspaceId: string, filePath: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.DELETE_FILE, { workspaceId, filePath }),
    renameFile: (workspaceId: string, filePath: string, newName: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.RENAME_FILE, { workspaceId, filePath, newName }),
    moveFile: (workspaceId: string, filePath: string, destDir: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.MOVE_FILE, { workspaceId, filePath, destDir }),
    copyFile: (workspaceId: string, filePath: string, destDir?: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.COPY_FILE, { workspaceId, filePath, destDir }),
    createFile: (workspaceId: string, dir: string | null, name: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.CREATE_FILE, { workspaceId, dir, name }),
    createFolder: (workspaceId: string, dir: string | null, name: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.CREATE_FOLDER, { workspaceId, dir, name }),
    search: (workspaceId: string, query: string) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.SEARCH, { workspaceId, query }),
    getTags: (workspaceId: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.GET_TAGS, { workspaceId }),
    setTags: (workspaceId: string, filePath: string, tags: string[]) =>
      ipcRenderer.invoke(WORKSPACE_CHANNELS.SET_TAGS, { workspaceId, filePath, tags }),
    exportFile: (
      workspaceId: string,
      filePath: string,
      format: 'png' | 'svg' | 'json',
      data: string,
      scene: any,
    ) => ipcRenderer.invoke(WORKSPACE_CHANNELS.EXPORT_FILE, { workspaceId, filePath, format, data, scene }),
  },
  plugins: {
    list: () => ipcRenderer.invoke(PLUGIN_CHANNELS.LIST),
    getContributions: () => ipcRenderer.invoke(PLUGIN_CHANNELS.GET_CONTRIBUTIONS),
    installFromFolder: () => ipcRenderer.invoke(PLUGIN_CHANNELS.INSTALL_FROM_FOLDER),
    enable: (id: string) => ipcRenderer.invoke(PLUGIN_CHANNELS.ENABLE, { id }),
    disable: (id: string) => ipcRenderer.invoke(PLUGIN_CHANNELS.DISABLE, { id }),
    uninstall: (id: string) => ipcRenderer.invoke(PLUGIN_CHANNELS.UNINSTALL, { id }),
  },
  ai: {
    validate: (raw: string) => ipcRenderer.invoke(AI_CHANNELS.VALIDATE, { raw }),
    apply: (payload: any) => ipcRenderer.invoke(AI_CHANNELS.APPLY, { payload }),
  },
  templates: {
    list: () => ipcRenderer.invoke(TEMPLATE_CHANNELS.LIST),
    apply: (id: string) => ipcRenderer.invoke(TEMPLATE_CHANNELS.APPLY, { id }),
    save: (input: any) => ipcRenderer.invoke(TEMPLATE_CHANNELS.SAVE, input),
  },
  recents: {
    list: () => ipcRenderer.invoke(RECENT_CHANNELS.LIST),
    add: (entry: any) => ipcRenderer.invoke(RECENT_CHANNELS.ADD, entry),
    remove: (filePath: string) => ipcRenderer.invoke(RECENT_CHANNELS.REMOVE, { path: filePath }),
    clear: () => ipcRenderer.invoke(RECENT_CHANNELS.CLEAR),
  },
  libraries: {
    list: () => ipcRenderer.invoke(LIBRARY_CHANNELS.LIST),
    get: (id: string) => ipcRenderer.invoke(LIBRARY_CHANNELS.GET, { id }),
    import: () => ipcRenderer.invoke(LIBRARY_CHANNELS.IMPORT),
    addItems: (id: string, items: any[]) => ipcRenderer.invoke(LIBRARY_CHANNELS.ADD_ITEMS, { id, items }),
    remove: (id: string) => ipcRenderer.invoke(LIBRARY_CHANNELS.REMOVE, { id }),
    export: (id: string) => ipcRenderer.invoke(LIBRARY_CHANNELS.EXPORT, { id }),
  },
  bulk: {
    rename: (workspaceId: string, files: string[], options: any) =>
      ipcRenderer.invoke(BULK_CHANNELS.RENAME, { workspaceId, files, options }),
    delete: (workspaceId: string, files: string[]) =>
      ipcRenderer.invoke(BULK_CHANNELS.DELETE, { workspaceId, files }),
    move: (workspaceId: string, files: string[], destDir: string) =>
      ipcRenderer.invoke(BULK_CHANNELS.MOVE, { workspaceId, files, destDir }),
  },
  presentation: {
    getDeck: (workspaceId: string, filePath: string, scene: any) =>
      ipcRenderer.invoke(PRESENTATION_CHANNELS.GET_DECK, { workspaceId, filePath, scene }),
    setNotes: (workspaceId: string, filePath: string, slideId: string, notes: string) =>
      ipcRenderer.invoke(PRESENTATION_CHANNELS.SET_NOTES, { workspaceId, filePath, slideId, notes }),
  },
  review: {
    get: (workspaceId: string, filePath: string) => ipcRenderer.invoke(REVIEW_CHANNELS.GET, { workspaceId, filePath }),
    addPin: (workspaceId: string, filePath: string, x: number, y: number, author: string, body: string) =>
      ipcRenderer.invoke(REVIEW_CHANNELS.ADD_PIN, { workspaceId, filePath, x, y, author, body }),
    addComment: (workspaceId: string, filePath: string, pinId: string, author: string, body: string) =>
      ipcRenderer.invoke(REVIEW_CHANNELS.ADD_COMMENT, { workspaceId, filePath, pinId, author, body }),
    setResolved: (workspaceId: string, filePath: string, pinId: string, resolved: boolean) =>
      ipcRenderer.invoke(REVIEW_CHANNELS.SET_RESOLVED, { workspaceId, filePath, pinId, resolved }),
    deletePin: (workspaceId: string, filePath: string, pinId: string) =>
      ipcRenderer.invoke(REVIEW_CHANNELS.DELETE_PIN, { workspaceId, filePath, pinId }),
  },
  stats: {
    compute: (workspaceId: string) => ipcRenderer.invoke(STATS_CHANNELS.COMPUTE, { workspaceId }),
  },
  git: {
    status: (workspaceId: string) => ipcRenderer.invoke(GIT_CHANNELS.STATUS, { workspaceId }),
    commit: (workspaceId: string, message: string, files?: string[]) =>
      ipcRenderer.invoke(GIT_CHANNELS.COMMIT, { workspaceId, message, files }),
    log: (workspaceId: string, limit?: number) => ipcRenderer.invoke(GIT_CHANNELS.LOG, { workspaceId, limit }),
    init: (workspaceId: string) => ipcRenderer.invoke(GIT_CHANNELS.INIT, { workspaceId }),
  },
  commands: {
    list: () => ipcRenderer.invoke(COMMAND_CHANNELS.LIST),
  },
  backups: {
    list: (originalPath?: string) => ipcRenderer.invoke(BACKUP_CHANNELS.LIST, { originalPath }),
    restore: (id: string, destPath?: string) => ipcRenderer.invoke(BACKUP_CHANNELS.RESTORE, { id, destPath }),
  },
  markdown: {
    export: (workspaceId: string, baseName: string, options: any, imageData: string, scene: any, bodyText?: string) =>
      ipcRenderer.invoke(MARKDOWN_CHANNELS.EXPORT, { workspaceId, baseName, options, imageData, scene, bodyText }),
  },
  import: {
    pickImage: () => ipcRenderer.invoke(IMPORT_CHANNELS.PICK_IMAGE),
  },
  // Menu/keyboard commands forwarded from the main process.
  onMenuCommand: (cb: (cmd: string) => void) => {
    const listener = (_e: any, cmd: string) => cb(cmd);
    ipcRenderer.on('menu:command', listener);
    return () => ipcRenderer.removeListener('menu:command', listener);
  },
});

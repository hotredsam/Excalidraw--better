import { contextBridge, ipcRenderer } from 'electron';
import { APP_CHANNELS, PROFILE_CHANNELS, SETTINGS_CHANNELS, WORKSPACE_CHANNELS, PLUGIN_CHANNELS, AI_IMPORT_CHANNELS } from '@excalibur/ipc';

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
    listFiles: (workspaceId: string, subDir?: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.LIST_FILES, { workspaceId, subDir }),
    readFile: (workspaceId: string, filePath: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.READ_FILE, { workspaceId, filePath }),
    readExcalidrawFile: (workspaceId: string, filePath: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, { workspaceId, filePath }),
    writeFile: (workspaceId: string, filePath: string, content: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.WRITE_FILE, { workspaceId, filePath, content }),
    deleteFile: (workspaceId: string, filePath: string) => ipcRenderer.invoke(WORKSPACE_CHANNELS.DELETE_FILE, { workspaceId, filePath }),
  },
  plugins: {
    list: () => ipcRenderer.invoke(PLUGIN_CHANNELS.LIST),
    setEnabled: (id: string, enabled: boolean) => ipcRenderer.invoke(PLUGIN_CHANNELS.SET_ENABLED, { id, enabled }),
  },
  aiImport: {
    validate: (content: string) => ipcRenderer.invoke(AI_IMPORT_CHANNELS.VALIDATE, { content }),
    apply: (payload: unknown) => ipcRenderer.invoke(AI_IMPORT_CHANNELS.APPLY, { payload }),
  },
});

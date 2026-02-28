import { contextBridge, ipcRenderer } from 'electron';
import { APP_CHANNELS, PROFILE_CHANNELS, SETTINGS_CHANNELS } from '@excalibur/ipc';

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
  },
});

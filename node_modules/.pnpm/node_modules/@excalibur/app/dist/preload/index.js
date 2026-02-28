"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_1 = require("@excalibur/ipc");
electron_1.contextBridge.exposeInMainWorld('api', {
    app: {
        ping: () => electron_1.ipcRenderer.invoke(ipc_1.APP_CHANNELS.PING),
    },
    profiles: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.PROFILE_CHANNELS.LIST),
        getActive: () => electron_1.ipcRenderer.invoke(ipc_1.PROFILE_CHANNELS.GET_ACTIVE),
        setActive: (id) => electron_1.ipcRenderer.invoke(ipc_1.PROFILE_CHANNELS.SET_ACTIVE, { id }),
        create: (name) => electron_1.ipcRenderer.invoke(ipc_1.PROFILE_CHANNELS.CREATE, { name }),
        rename: (id, name) => electron_1.ipcRenderer.invoke(ipc_1.PROFILE_CHANNELS.RENAME, { id, name }),
        delete: (id) => electron_1.ipcRenderer.invoke(ipc_1.PROFILE_CHANNELS.DELETE, { id }),
    },
    settings: {
        get: () => electron_1.ipcRenderer.invoke(ipc_1.SETTINGS_CHANNELS.GET),
        update: (partial) => electron_1.ipcRenderer.invoke(ipc_1.SETTINGS_CHANNELS.UPDATE, partial),
    },
    workspaces: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.LIST),
        add: () => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.ADD),
        remove: (id) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.REMOVE, { id }),
        setActive: (id) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.SET_ACTIVE, { id }),
        getActive: () => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.GET_ACTIVE),
        listFiles: (workspaceId, subDir) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.LIST_FILES, { workspaceId, subDir }),
        readFile: (workspaceId, filePath) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.READ_FILE, { workspaceId, filePath }),
        readExcalidrawFile: (workspaceId, filePath) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.READ_EXCALIDRAW_FILE, { workspaceId, filePath }),
        writeFile: (workspaceId, filePath, content) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.WRITE_FILE, { workspaceId, filePath, content }),
        deleteFile: (workspaceId, filePath) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.DELETE_FILE, { workspaceId, filePath }),
    },
    plugins: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.LIST),
        setEnabled: (id, enabled) => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.SET_ENABLED, { id, enabled }),
    },
});

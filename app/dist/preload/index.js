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
});

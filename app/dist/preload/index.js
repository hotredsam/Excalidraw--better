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
        writeBinaryFile: (workspaceId, filePath, base64) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.WRITE_BINARY_FILE, { workspaceId, filePath, base64 }),
        deleteFile: (workspaceId, filePath) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.DELETE_FILE, { workspaceId, filePath }),
        renameFile: (workspaceId, filePath, newName) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.RENAME_FILE, { workspaceId, filePath, newName }),
        moveFile: (workspaceId, filePath, destDir) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.MOVE_FILE, { workspaceId, filePath, destDir }),
        copyFile: (workspaceId, filePath, destDir) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.COPY_FILE, { workspaceId, filePath, destDir }),
        createFile: (workspaceId, dir, name) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.CREATE_FILE, { workspaceId, dir, name }),
        createFolder: (workspaceId, dir, name) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.CREATE_FOLDER, { workspaceId, dir, name }),
        search: (workspaceId, query) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.SEARCH, { workspaceId, query }),
        getTags: (workspaceId) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.GET_TAGS, { workspaceId }),
        setTags: (workspaceId, filePath, tags) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.SET_TAGS, { workspaceId, filePath, tags }),
        exportFile: (workspaceId, filePath, format, data, scene) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CHANNELS.EXPORT_FILE, { workspaceId, filePath, format, data, scene }),
    },
    plugins: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.LIST),
        getContributions: () => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.GET_CONTRIBUTIONS),
        installFromFolder: () => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.INSTALL_FROM_FOLDER),
        enable: (id) => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.ENABLE, { id }),
        disable: (id) => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.DISABLE, { id }),
        uninstall: (id) => electron_1.ipcRenderer.invoke(ipc_1.PLUGIN_CHANNELS.UNINSTALL, { id }),
    },
    ai: {
        validate: (raw) => electron_1.ipcRenderer.invoke(ipc_1.AI_CHANNELS.VALIDATE, { raw }),
        apply: (payload) => electron_1.ipcRenderer.invoke(ipc_1.AI_CHANNELS.APPLY, { payload }),
    },
    templates: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.TEMPLATE_CHANNELS.LIST),
        apply: (id) => electron_1.ipcRenderer.invoke(ipc_1.TEMPLATE_CHANNELS.APPLY, { id }),
        save: (input) => electron_1.ipcRenderer.invoke(ipc_1.TEMPLATE_CHANNELS.SAVE, input),
    },
    recents: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.RECENT_CHANNELS.LIST),
        add: (entry) => electron_1.ipcRenderer.invoke(ipc_1.RECENT_CHANNELS.ADD, entry),
        remove: (filePath) => electron_1.ipcRenderer.invoke(ipc_1.RECENT_CHANNELS.REMOVE, { path: filePath }),
        clear: () => electron_1.ipcRenderer.invoke(ipc_1.RECENT_CHANNELS.CLEAR),
    },
    libraries: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.LIBRARY_CHANNELS.LIST),
        get: (id) => electron_1.ipcRenderer.invoke(ipc_1.LIBRARY_CHANNELS.GET, { id }),
        import: () => electron_1.ipcRenderer.invoke(ipc_1.LIBRARY_CHANNELS.IMPORT),
        addItems: (id, items) => electron_1.ipcRenderer.invoke(ipc_1.LIBRARY_CHANNELS.ADD_ITEMS, { id, items }),
        remove: (id) => electron_1.ipcRenderer.invoke(ipc_1.LIBRARY_CHANNELS.REMOVE, { id }),
        export: (id) => electron_1.ipcRenderer.invoke(ipc_1.LIBRARY_CHANNELS.EXPORT, { id }),
    },
    bulk: {
        rename: (workspaceId, files, options) => electron_1.ipcRenderer.invoke(ipc_1.BULK_CHANNELS.RENAME, { workspaceId, files, options }),
        delete: (workspaceId, files) => electron_1.ipcRenderer.invoke(ipc_1.BULK_CHANNELS.DELETE, { workspaceId, files }),
        move: (workspaceId, files, destDir) => electron_1.ipcRenderer.invoke(ipc_1.BULK_CHANNELS.MOVE, { workspaceId, files, destDir }),
    },
    presentation: {
        getDeck: (workspaceId, filePath, scene) => electron_1.ipcRenderer.invoke(ipc_1.PRESENTATION_CHANNELS.GET_DECK, { workspaceId, filePath, scene }),
        setNotes: (workspaceId, filePath, slideId, notes) => electron_1.ipcRenderer.invoke(ipc_1.PRESENTATION_CHANNELS.SET_NOTES, { workspaceId, filePath, slideId, notes }),
    },
    review: {
        get: (workspaceId, filePath) => electron_1.ipcRenderer.invoke(ipc_1.REVIEW_CHANNELS.GET, { workspaceId, filePath }),
        addPin: (workspaceId, filePath, x, y, author, body) => electron_1.ipcRenderer.invoke(ipc_1.REVIEW_CHANNELS.ADD_PIN, { workspaceId, filePath, x, y, author, body }),
        addComment: (workspaceId, filePath, pinId, author, body) => electron_1.ipcRenderer.invoke(ipc_1.REVIEW_CHANNELS.ADD_COMMENT, { workspaceId, filePath, pinId, author, body }),
        setResolved: (workspaceId, filePath, pinId, resolved) => electron_1.ipcRenderer.invoke(ipc_1.REVIEW_CHANNELS.SET_RESOLVED, { workspaceId, filePath, pinId, resolved }),
        deletePin: (workspaceId, filePath, pinId) => electron_1.ipcRenderer.invoke(ipc_1.REVIEW_CHANNELS.DELETE_PIN, { workspaceId, filePath, pinId }),
    },
    stats: {
        compute: (workspaceId) => electron_1.ipcRenderer.invoke(ipc_1.STATS_CHANNELS.COMPUTE, { workspaceId }),
    },
    git: {
        status: (workspaceId) => electron_1.ipcRenderer.invoke(ipc_1.GIT_CHANNELS.STATUS, { workspaceId }),
        commit: (workspaceId, message, files) => electron_1.ipcRenderer.invoke(ipc_1.GIT_CHANNELS.COMMIT, { workspaceId, message, files }),
        log: (workspaceId, limit) => electron_1.ipcRenderer.invoke(ipc_1.GIT_CHANNELS.LOG, { workspaceId, limit }),
        init: (workspaceId) => electron_1.ipcRenderer.invoke(ipc_1.GIT_CHANNELS.INIT, { workspaceId }),
    },
    commands: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.COMMAND_CHANNELS.LIST),
    },
    backups: {
        list: (originalPath) => electron_1.ipcRenderer.invoke(ipc_1.BACKUP_CHANNELS.LIST, { originalPath }),
        restore: (id, destPath) => electron_1.ipcRenderer.invoke(ipc_1.BACKUP_CHANNELS.RESTORE, { id, destPath }),
    },
    markdown: {
        export: (workspaceId, baseName, options, imageData, scene, bodyText) => electron_1.ipcRenderer.invoke(ipc_1.MARKDOWN_CHANNELS.EXPORT, { workspaceId, baseName, options, imageData, scene, bodyText }),
    },
    import: {
        pickImage: () => electron_1.ipcRenderer.invoke(ipc_1.IMPORT_CHANNELS.PICK_IMAGE),
        pickSvgAsElements: () => electron_1.ipcRenderer.invoke(ipc_1.IMPORT_CHANNELS.PICK_SVG_AS_ELEMENTS),
    },
    snippets: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.SNIPPET_CHANNELS.LIST),
        get: (id) => electron_1.ipcRenderer.invoke(ipc_1.SNIPPET_CHANNELS.GET, { id }),
        save: (input) => electron_1.ipcRenderer.invoke(ipc_1.SNIPPET_CHANNELS.SAVE, input),
        remove: (id) => electron_1.ipcRenderer.invoke(ipc_1.SNIPPET_CHANNELS.REMOVE, { id }),
        rename: (id, title) => electron_1.ipcRenderer.invoke(ipc_1.SNIPPET_CHANNELS.RENAME, { id, title }),
    },
    shortcuts: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.SHORTCUT_CHANNELS.LIST),
        set: (commandId, accelerator, force) => electron_1.ipcRenderer.invoke(ipc_1.SHORTCUT_CHANNELS.SET, { commandId, accelerator, force }),
        reset: (commandId) => electron_1.ipcRenderer.invoke(ipc_1.SHORTCUT_CHANNELS.RESET, { commandId }),
    },
    workspaceConfig: {
        get: (workspaceId) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CONFIG_CHANNELS.GET, { workspaceId }),
        update: (workspaceId, partial) => electron_1.ipcRenderer.invoke(ipc_1.WORKSPACE_CONFIG_CHANNELS.UPDATE, { workspaceId, partial }),
    },
    styles: {
        list: () => electron_1.ipcRenderer.invoke(ipc_1.STYLE_CHANNELS.LIST),
        save: (input) => electron_1.ipcRenderer.invoke(ipc_1.STYLE_CHANNELS.SAVE, input),
        remove: (id) => electron_1.ipcRenderer.invoke(ipc_1.STYLE_CHANNELS.REMOVE, { id }),
    },
    // Menu/keyboard commands forwarded from the main process.
    onMenuCommand: (cb) => {
        const listener = (_e, cmd) => cb(cmd);
        electron_1.ipcRenderer.on('menu:command', listener);
        return () => electron_1.ipcRenderer.removeListener('menu:command', listener);
    },
});

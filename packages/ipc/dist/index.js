"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_CHANNELS = exports.AI_CHANNELS = exports.PLUGIN_CHANNELS = exports.WORKSPACE_CHANNELS = exports.SETTINGS_CHANNELS = exports.PROFILE_CHANNELS = exports.APP_CHANNELS = void 0;
exports.APP_CHANNELS = {
    PING: 'app:ping',
};
exports.PROFILE_CHANNELS = {
    LIST: 'profiles:list',
    CREATE: 'profiles:create',
    RENAME: 'profiles:rename',
    DELETE: 'profiles:delete',
    SET_ACTIVE: 'profiles:set-active',
    GET_ACTIVE: 'profiles:get-active',
};
exports.SETTINGS_CHANNELS = {
    GET: 'settings:get',
    UPDATE: 'settings:update',
};
exports.WORKSPACE_CHANNELS = {
    LIST: 'workspaces:list',
    ADD: 'workspaces:add',
    REMOVE: 'workspaces:remove',
    SET_ACTIVE: 'workspaces:set-active',
    GET_ACTIVE: 'workspaces:get-active',
    LIST_FILES: 'workspaces:list-files',
    READ_FILE: 'workspaces:read-file',
    WRITE_FILE: 'workspaces:write-file',
    WRITE_BINARY_FILE: 'workspaces:write-binary-file',
    DELETE_FILE: 'workspaces:delete-file',
    READ_EXCALIDRAW_FILE: 'workspaces:read-excalidraw-file',
    // File management
    RENAME_FILE: 'workspaces:rename-file',
    MOVE_FILE: 'workspaces:move-file',
    COPY_FILE: 'workspaces:copy-file',
    CREATE_FILE: 'workspaces:create-file',
    CREATE_FOLDER: 'workspaces:create-folder',
    // Search & tags
    SEARCH: 'workspaces:search',
    GET_TAGS: 'workspaces:get-tags',
    SET_TAGS: 'workspaces:set-tags',
    // Export (scene-embedded)
    EXPORT_FILE: 'workspaces:export-file',
};
exports.PLUGIN_CHANNELS = {
    LIST: 'plugins:list',
    INSTALL_FROM_FOLDER: 'plugins:install-from-folder',
    ENABLE: 'plugins:enable',
    DISABLE: 'plugins:disable',
    UNINSTALL: 'plugins:uninstall',
    GET_CONTRIBUTIONS: 'plugins:get-contributions',
};
exports.AI_CHANNELS = {
    VALIDATE: 'ai:validate',
    APPLY: 'ai:apply',
};
exports.TEMPLATE_CHANNELS = {
    LIST: 'templates:list',
    APPLY: 'templates:apply',
    SAVE: 'templates:save',
};

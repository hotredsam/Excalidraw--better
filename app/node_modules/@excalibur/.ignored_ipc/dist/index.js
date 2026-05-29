"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKSPACE_CHANNELS = exports.SETTINGS_CHANNELS = exports.PROFILE_CHANNELS = exports.APP_CHANNELS = void 0;
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
    DELETE_FILE: 'workspaces:delete-file',
    READ_EXCALIDRAW_FILE: 'workspaces:read-excalidraw-file',
};

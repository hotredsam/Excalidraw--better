"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CHANNELS = exports.PROFILE_CHANNELS = exports.APP_CHANNELS = void 0;
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

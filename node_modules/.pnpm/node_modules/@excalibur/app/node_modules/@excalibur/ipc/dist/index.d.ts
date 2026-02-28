export declare const APP_CHANNELS: {
    readonly PING: "app:ping";
};
export declare const PROFILE_CHANNELS: {
    readonly LIST: "profiles:list";
    readonly CREATE: "profiles:create";
    readonly RENAME: "profiles:rename";
    readonly DELETE: "profiles:delete";
    readonly SET_ACTIVE: "profiles:set-active";
    readonly GET_ACTIVE: "profiles:get-active";
};
export declare const SETTINGS_CHANNELS: {
    readonly GET: "settings:get";
    readonly UPDATE: "settings:update";
};
export type AppChannels = typeof APP_CHANNELS[keyof typeof APP_CHANNELS];
export type ProfileChannels = typeof PROFILE_CHANNELS[keyof typeof PROFILE_CHANNELS];
export type SettingsChannels = typeof SETTINGS_CHANNELS[keyof typeof SETTINGS_CHANNELS];

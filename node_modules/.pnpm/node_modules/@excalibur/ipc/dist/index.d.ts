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
export declare const WORKSPACE_CHANNELS: {
    readonly LIST: "workspaces:list";
    readonly ADD: "workspaces:add";
    readonly REMOVE: "workspaces:remove";
    readonly SET_ACTIVE: "workspaces:set-active";
    readonly GET_ACTIVE: "workspaces:get-active";
    readonly LIST_FILES: "workspaces:list-files";
    readonly READ_FILE: "workspaces:read-file";
    readonly WRITE_FILE: "workspaces:write-file";
    readonly DELETE_FILE: "workspaces:delete-file";
};
export type AppChannels = typeof APP_CHANNELS[keyof typeof APP_CHANNELS];
export type ProfileChannels = typeof PROFILE_CHANNELS[keyof typeof PROFILE_CHANNELS];
export type SettingsChannels = typeof SETTINGS_CHANNELS[keyof typeof SETTINGS_CHANNELS];
export type WorkspaceChannels = typeof WORKSPACE_CHANNELS[keyof typeof WORKSPACE_CHANNELS];

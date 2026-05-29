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
    readonly WRITE_BINARY_FILE: "workspaces:write-binary-file";
    readonly DELETE_FILE: "workspaces:delete-file";
    readonly READ_EXCALIDRAW_FILE: "workspaces:read-excalidraw-file";
    readonly RENAME_FILE: "workspaces:rename-file";
    readonly MOVE_FILE: "workspaces:move-file";
    readonly COPY_FILE: "workspaces:copy-file";
    readonly CREATE_FILE: "workspaces:create-file";
    readonly CREATE_FOLDER: "workspaces:create-folder";
    readonly SEARCH: "workspaces:search";
    readonly GET_TAGS: "workspaces:get-tags";
    readonly SET_TAGS: "workspaces:set-tags";
    readonly EXPORT_FILE: "workspaces:export-file";
};
export declare const PLUGIN_CHANNELS: {
    readonly LIST: "plugins:list";
    readonly INSTALL_FROM_FOLDER: "plugins:install-from-folder";
    readonly ENABLE: "plugins:enable";
    readonly DISABLE: "plugins:disable";
    readonly UNINSTALL: "plugins:uninstall";
    readonly GET_CONTRIBUTIONS: "plugins:get-contributions";
};
export declare const AI_CHANNELS: {
    readonly VALIDATE: "ai:validate";
    readonly APPLY: "ai:apply";
};
export declare const TEMPLATE_CHANNELS: {
    readonly LIST: "templates:list";
    readonly APPLY: "templates:apply";
    readonly SAVE: "templates:save";
};
export type AppChannels = typeof APP_CHANNELS[keyof typeof APP_CHANNELS];
export type ProfileChannels = typeof PROFILE_CHANNELS[keyof typeof PROFILE_CHANNELS];
export type SettingsChannels = typeof SETTINGS_CHANNELS[keyof typeof SETTINGS_CHANNELS];
export type WorkspaceChannels = typeof WORKSPACE_CHANNELS[keyof typeof WORKSPACE_CHANNELS];
export type PluginChannels = typeof PLUGIN_CHANNELS[keyof typeof PLUGIN_CHANNELS];
export type AiChannels = typeof AI_CHANNELS[keyof typeof AI_CHANNELS];
export type TemplateChannels = typeof TEMPLATE_CHANNELS[keyof typeof TEMPLATE_CHANNELS];

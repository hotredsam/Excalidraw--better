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
export declare const RECENT_CHANNELS: {
    readonly LIST: "recents:list";
    readonly ADD: "recents:add";
    readonly REMOVE: "recents:remove";
    readonly CLEAR: "recents:clear";
};
export declare const LIBRARY_CHANNELS: {
    readonly LIST: "libraries:list";
    readonly GET: "libraries:get";
    readonly IMPORT: "libraries:import";
    readonly ADD_ITEMS: "libraries:add-items";
    readonly REMOVE: "libraries:remove";
    readonly EXPORT: "libraries:export";
};
export declare const BULK_CHANNELS: {
    readonly RENAME: "bulk:rename";
    readonly DELETE: "bulk:delete";
    readonly MOVE: "bulk:move";
};
export declare const PRESENTATION_CHANNELS: {
    readonly GET_DECK: "presentation:get-deck";
    readonly SET_NOTES: "presentation:set-notes";
};
export declare const REVIEW_CHANNELS: {
    readonly GET: "review:get";
    readonly ADD_PIN: "review:add-pin";
    readonly ADD_COMMENT: "review:add-comment";
    readonly SET_RESOLVED: "review:set-resolved";
    readonly DELETE_PIN: "review:delete-pin";
};
export declare const STATS_CHANNELS: {
    readonly COMPUTE: "stats:compute";
};
export declare const GIT_CHANNELS: {
    readonly STATUS: "git:status";
    readonly COMMIT: "git:commit";
    readonly LOG: "git:log";
    readonly INIT: "git:init";
};
export declare const COMMAND_CHANNELS: {
    readonly LIST: "commands:list";
};
export declare const BACKUP_CHANNELS: {
    readonly LIST: "backups:list";
    readonly RESTORE: "backups:restore";
};
export declare const MARKDOWN_CHANNELS: {
    readonly EXPORT: "markdown:export";
};
export declare const IMPORT_CHANNELS: {
    readonly PICK_IMAGE: "import:pick-image";
    readonly PICK_SVG_AS_ELEMENTS: "import:pick-svg-elements";
};
export declare const SNIPPET_CHANNELS: {
    readonly LIST: "snippets:list";
    readonly GET: "snippets:get";
    readonly SAVE: "snippets:save";
    readonly REMOVE: "snippets:remove";
    readonly RENAME: "snippets:rename";
};
export declare const SHORTCUT_CHANNELS: {
    readonly LIST: "shortcuts:list";
    readonly SET: "shortcuts:set";
    readonly RESET: "shortcuts:reset";
};
export declare const WORKSPACE_CONFIG_CHANNELS: {
    readonly GET: "workspace-config:get";
    readonly UPDATE: "workspace-config:update";
};
export declare const STYLE_CHANNELS: {
    readonly LIST: "styles:list";
    readonly SAVE: "styles:save";
    readonly REMOVE: "styles:remove";
};
export type AppChannels = typeof APP_CHANNELS[keyof typeof APP_CHANNELS];
export type ProfileChannels = typeof PROFILE_CHANNELS[keyof typeof PROFILE_CHANNELS];
export type SettingsChannels = typeof SETTINGS_CHANNELS[keyof typeof SETTINGS_CHANNELS];
export type WorkspaceChannels = typeof WORKSPACE_CHANNELS[keyof typeof WORKSPACE_CHANNELS];
export type PluginChannels = typeof PLUGIN_CHANNELS[keyof typeof PLUGIN_CHANNELS];
export type AiChannels = typeof AI_CHANNELS[keyof typeof AI_CHANNELS];
export type TemplateChannels = typeof TEMPLATE_CHANNELS[keyof typeof TEMPLATE_CHANNELS];

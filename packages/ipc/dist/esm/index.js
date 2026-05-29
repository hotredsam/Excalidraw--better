export const APP_CHANNELS = {
    PING: 'app:ping',
};
export const PROFILE_CHANNELS = {
    LIST: 'profiles:list',
    CREATE: 'profiles:create',
    RENAME: 'profiles:rename',
    DELETE: 'profiles:delete',
    SET_ACTIVE: 'profiles:set-active',
    GET_ACTIVE: 'profiles:get-active',
};
export const SETTINGS_CHANNELS = {
    GET: 'settings:get',
    UPDATE: 'settings:update',
};
export const WORKSPACE_CHANNELS = {
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
export const PLUGIN_CHANNELS = {
    LIST: 'plugins:list',
    INSTALL_FROM_FOLDER: 'plugins:install-from-folder',
    ENABLE: 'plugins:enable',
    DISABLE: 'plugins:disable',
    UNINSTALL: 'plugins:uninstall',
    GET_CONTRIBUTIONS: 'plugins:get-contributions',
};
export const AI_CHANNELS = {
    VALIDATE: 'ai:validate',
    APPLY: 'ai:apply',
};
export const TEMPLATE_CHANNELS = {
    LIST: 'templates:list',
    APPLY: 'templates:apply',
    SAVE: 'templates:save',
};
export const RECENT_CHANNELS = {
    LIST: 'recents:list',
    ADD: 'recents:add',
    REMOVE: 'recents:remove',
    CLEAR: 'recents:clear',
};
export const LIBRARY_CHANNELS = {
    LIST: 'libraries:list',
    GET: 'libraries:get',
    IMPORT: 'libraries:import',
    ADD_ITEMS: 'libraries:add-items',
    REMOVE: 'libraries:remove',
    EXPORT: 'libraries:export',
};
export const BULK_CHANNELS = {
    RENAME: 'bulk:rename',
    DELETE: 'bulk:delete',
    MOVE: 'bulk:move',
};
export const PRESENTATION_CHANNELS = {
    GET_DECK: 'presentation:get-deck',
    SET_NOTES: 'presentation:set-notes',
};
export const REVIEW_CHANNELS = {
    GET: 'review:get',
    ADD_PIN: 'review:add-pin',
    ADD_COMMENT: 'review:add-comment',
    SET_RESOLVED: 'review:set-resolved',
    DELETE_PIN: 'review:delete-pin',
};
export const STATS_CHANNELS = {
    COMPUTE: 'stats:compute',
};
export const GIT_CHANNELS = {
    STATUS: 'git:status',
    COMMIT: 'git:commit',
    LOG: 'git:log',
    INIT: 'git:init',
};
export const COMMAND_CHANNELS = {
    LIST: 'commands:list',
};
export const BACKUP_CHANNELS = {
    LIST: 'backups:list',
    RESTORE: 'backups:restore',
};
export const MARKDOWN_CHANNELS = {
    EXPORT: 'markdown:export',
};
export const IMPORT_CHANNELS = {
    PICK_IMAGE: 'import:pick-image',
    PICK_SVG_AS_ELEMENTS: 'import:pick-svg-elements',
};
export const SNIPPET_CHANNELS = {
    LIST: 'snippets:list',
    GET: 'snippets:get',
    SAVE: 'snippets:save',
    REMOVE: 'snippets:remove',
    RENAME: 'snippets:rename',
};
export const SHORTCUT_CHANNELS = {
    LIST: 'shortcuts:list',
    SET: 'shortcuts:set',
    RESET: 'shortcuts:reset',
};
export const WORKSPACE_CONFIG_CHANNELS = {
    GET: 'workspace-config:get',
    UPDATE: 'workspace-config:update',
};
export const STYLE_CHANNELS = {
    LIST: 'styles:list',
    SAVE: 'styles:save',
    REMOVE: 'styles:remove',
};

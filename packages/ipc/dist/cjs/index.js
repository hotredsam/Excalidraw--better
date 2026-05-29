"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STYLE_CHANNELS = exports.WORKSPACE_CONFIG_CHANNELS = exports.SHORTCUT_CHANNELS = exports.SNIPPET_CHANNELS = exports.IMPORT_CHANNELS = exports.MARKDOWN_CHANNELS = exports.BACKUP_CHANNELS = exports.COMMAND_CHANNELS = exports.GIT_CHANNELS = exports.STATS_CHANNELS = exports.REVIEW_CHANNELS = exports.PRESENTATION_CHANNELS = exports.BULK_CHANNELS = exports.LIBRARY_CHANNELS = exports.RECENT_CHANNELS = exports.TEMPLATE_CHANNELS = exports.AI_CHANNELS = exports.PLUGIN_CHANNELS = exports.WORKSPACE_CHANNELS = exports.SETTINGS_CHANNELS = exports.PROFILE_CHANNELS = exports.APP_CHANNELS = void 0;
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
exports.RECENT_CHANNELS = {
    LIST: 'recents:list',
    ADD: 'recents:add',
    REMOVE: 'recents:remove',
    CLEAR: 'recents:clear',
};
exports.LIBRARY_CHANNELS = {
    LIST: 'libraries:list',
    GET: 'libraries:get',
    IMPORT: 'libraries:import',
    ADD_ITEMS: 'libraries:add-items',
    REMOVE: 'libraries:remove',
    EXPORT: 'libraries:export',
};
exports.BULK_CHANNELS = {
    RENAME: 'bulk:rename',
    DELETE: 'bulk:delete',
    MOVE: 'bulk:move',
};
exports.PRESENTATION_CHANNELS = {
    GET_DECK: 'presentation:get-deck',
    SET_NOTES: 'presentation:set-notes',
};
exports.REVIEW_CHANNELS = {
    GET: 'review:get',
    ADD_PIN: 'review:add-pin',
    ADD_COMMENT: 'review:add-comment',
    SET_RESOLVED: 'review:set-resolved',
    DELETE_PIN: 'review:delete-pin',
};
exports.STATS_CHANNELS = {
    COMPUTE: 'stats:compute',
};
exports.GIT_CHANNELS = {
    STATUS: 'git:status',
    COMMIT: 'git:commit',
    LOG: 'git:log',
    INIT: 'git:init',
};
exports.COMMAND_CHANNELS = {
    LIST: 'commands:list',
};
exports.BACKUP_CHANNELS = {
    LIST: 'backups:list',
    RESTORE: 'backups:restore',
};
exports.MARKDOWN_CHANNELS = {
    EXPORT: 'markdown:export',
};
exports.IMPORT_CHANNELS = {
    PICK_IMAGE: 'import:pick-image',
    PICK_SVG_AS_ELEMENTS: 'import:pick-svg-elements',
};
exports.SNIPPET_CHANNELS = {
    LIST: 'snippets:list',
    GET: 'snippets:get',
    SAVE: 'snippets:save',
    REMOVE: 'snippets:remove',
    RENAME: 'snippets:rename',
};
exports.SHORTCUT_CHANNELS = {
    LIST: 'shortcuts:list',
    SET: 'shortcuts:set',
    RESET: 'shortcuts:reset',
};
exports.WORKSPACE_CONFIG_CHANNELS = {
    GET: 'workspace-config:get',
    UPDATE: 'workspace-config:update',
};
exports.STYLE_CHANNELS = {
    LIST: 'styles:list',
    SAVE: 'styles:save',
    REMOVE: 'styles:remove',
};

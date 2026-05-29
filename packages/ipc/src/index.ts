export const APP_CHANNELS = {
  PING: 'app:ping',
} as const;

export const PROFILE_CHANNELS = {
  LIST: 'profiles:list',
  CREATE: 'profiles:create',
  RENAME: 'profiles:rename',
  DELETE: 'profiles:delete',
  SET_ACTIVE: 'profiles:set-active',
  GET_ACTIVE: 'profiles:get-active',
} as const;

export const SETTINGS_CHANNELS = {
  GET: 'settings:get',
  UPDATE: 'settings:update',
} as const;

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
} as const;

export const PLUGIN_CHANNELS = {
  LIST: 'plugins:list',
  INSTALL_FROM_FOLDER: 'plugins:install-from-folder',
  ENABLE: 'plugins:enable',
  DISABLE: 'plugins:disable',
  UNINSTALL: 'plugins:uninstall',
  GET_CONTRIBUTIONS: 'plugins:get-contributions',
} as const;

export const AI_CHANNELS = {
  VALIDATE: 'ai:validate',
  APPLY: 'ai:apply',
} as const;

export const TEMPLATE_CHANNELS = {
  LIST: 'templates:list',
  APPLY: 'templates:apply',
  SAVE: 'templates:save',
} as const;

export type AppChannels = typeof APP_CHANNELS[keyof typeof APP_CHANNELS];
export type ProfileChannels = typeof PROFILE_CHANNELS[keyof typeof PROFILE_CHANNELS];
export type SettingsChannels = typeof SETTINGS_CHANNELS[keyof typeof SETTINGS_CHANNELS];
export type WorkspaceChannels = typeof WORKSPACE_CHANNELS[keyof typeof WORKSPACE_CHANNELS];
export type PluginChannels = typeof PLUGIN_CHANNELS[keyof typeof PLUGIN_CHANNELS];
export type AiChannels = typeof AI_CHANNELS[keyof typeof AI_CHANNELS];
export type TemplateChannels = typeof TEMPLATE_CHANNELS[keyof typeof TEMPLATE_CHANNELS];

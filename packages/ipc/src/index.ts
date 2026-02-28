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
} as const;

export type AppChannels = typeof APP_CHANNELS[keyof typeof APP_CHANNELS];
export type ProfileChannels = typeof PROFILE_CHANNELS[keyof typeof PROFILE_CHANNELS];
export type SettingsChannels = typeof SETTINGS_CHANNELS[keyof typeof SETTINGS_CHANNELS];
export type WorkspaceChannels = typeof WORKSPACE_CHANNELS[keyof typeof WORKSPACE_CHANNELS];

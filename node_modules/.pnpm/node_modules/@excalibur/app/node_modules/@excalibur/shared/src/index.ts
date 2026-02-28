export * from './config';
import { z } from 'zod';

export const AppPingSchema = z.object({
  ok: z.boolean(),
  version: z.string(),
  platform: z.string(),
});

export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastOpenedAt: z.number(),
});

export const ProfileListSchema = z.object({
  profiles: z.array(ProfileSchema),
});

export const SettingsSchema = z.object({
  autosave: z.boolean().default(true),
  autosaveIntervalSeconds: z.number().default(15),
  defaultExportFormat: z.enum(['png', 'svg']).default('png'),
  confirmOnDelete: z.boolean().default(true),
  showGrid: z.boolean().default(false),
});

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  lastOpenedAt: z.number(),
});

export const WorkspaceListSchema = z.object({
  workspaces: z.array(WorkspaceSchema),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceList = z.infer<typeof WorkspaceListSchema>;

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

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

export const FileInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  isDirectory: z.boolean(),
  size: z.number(),
  mtime: z.number(),
  extension: z.string().optional(),
});

export const ExcalidrawFileSchema = z.object({
  type: z.string().default('excalidraw'),
  version: z.number().optional().default(2),
  source: z.string().optional().default('https://excalidraw.com'),
  elements: z.array(z.any()).default([]),
  appState: z.record(z.any()).optional().default({}),
  files: z.record(z.any()).optional().default({}),
}).passthrough();

export type FileInfo = z.infer<typeof FileInfoSchema>;
export type ExcalidrawFile = z.infer<typeof ExcalidrawFileSchema>;

export function mergeExcalidraw(existing: any, elements: any[], appState: any): ExcalidrawFile {
  const merged = {
    ...existing,
    elements,
    appState: {
      ...(existing.appState || {}),
      ...appState
    }
  };
  return ExcalidrawFileSchema.parse(merged);
}

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

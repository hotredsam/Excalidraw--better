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

/**
 * Safely merge new scene data into an existing Excalidraw file object.
 * Preserves all extra fields not in elements/appState.
 */
export const mergeExcalidraw = (
  existing: ExcalidrawFile,
  elements: unknown[],
  appState: Record<string, unknown>
): ExcalidrawFile => {
  const merged = {
    ...existing,
    elements,
    appState: {
      ...(existing.appState || {}),
      ...appState
    }
  };
  return ExcalidrawFileSchema.parse(merged);
};

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

// Plugin types
export const PluginInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  enabled: z.boolean(),
  path: z.string(),
});

export const PluginInfoListSchema = z.object({
  plugins: z.array(PluginInfoSchema),
});

export type PluginInfo = z.infer<typeof PluginInfoSchema>;
export type PluginInfoList = z.infer<typeof PluginInfoListSchema>;

// AI Import payload types
const AiPluginScaffoldSchema = z.object({
  type: z.literal('plugin_scaffold'),
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Plugin id must contain only alphanumeric characters, hyphens, or underscores').max(64),
  name: z.string().max(128),
  version: z.string().default('0.1.0'),
  description: z.string().optional(),
  entry: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Entry filename must be safe').max(64).default('index.js'),
  code: z.string().max(1_000_000),
  manifest: z.record(z.unknown()).optional(),
});

const AiTemplatePackSchema = z.object({
  type: z.literal('template_pack'),
  name: z.string(),
  templates: z.array(z.object({
    name: z.string(),
    content: z.string(),
  })).min(1),
});

const AiSettingsBundleSchema = z.object({
  type: z.literal('settings_bundle'),
  settings: z.record(z.unknown()),
});

const AiDocsUpdateSchema = z.object({
  type: z.literal('docs_update'),
  filename: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Filename must contain only alphanumeric characters, dots, hyphens, or underscores').max(255),
  content: z.string().max(10_000_000),
});

export const AiPayloadSchema = z.discriminatedUnion('type', [
  AiPluginScaffoldSchema,
  AiTemplatePackSchema,
  AiSettingsBundleSchema,
  AiDocsUpdateSchema,
]);

export type AiPayload = z.infer<typeof AiPayloadSchema>;
export type AiPluginScaffold = z.infer<typeof AiPluginScaffoldSchema>;
export type AiTemplatePack = z.infer<typeof AiTemplatePackSchema>;
export type AiSettingsBundle = z.infer<typeof AiSettingsBundleSchema>;
export type AiDocsUpdate = z.infer<typeof AiDocsUpdateSchema>;

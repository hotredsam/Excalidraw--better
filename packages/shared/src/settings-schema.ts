import { z } from 'zod';

export const ThemeSchema = z.enum(['dark', 'light', 'system']).default('dark');

export const SettingsSchema = z.object({
  // Editing
  autosave: z.boolean().default(true),
  autosaveIntervalSeconds: z.number().min(2).max(600).default(15),
  showGrid: z.boolean().default(false),
  theme: ThemeSchema,
  // Files
  defaultExportFormat: z.enum(['png', 'svg']).default('png'),
  confirmOnDelete: z.boolean().default(true),
  recentsLimit: z.number().min(1).max(100).default(20),
  // Safety / history
  keepBackups: z.boolean().default(true),
  backupsToKeep: z.number().min(1).max(50).default(10),
  // Workspace
  autoOpenLastWorkspace: z.boolean().default(true),
  indexEmbeddedText: z.boolean().default(true),
});

export type Theme = z.infer<typeof ThemeSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

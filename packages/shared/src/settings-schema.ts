import { z } from 'zod';

export const SettingsSchema = z.object({
  autosave: z.boolean().default(true),
  autosaveIntervalSeconds: z.number().default(15),
  defaultExportFormat: z.enum(['png', 'svg']).default('png'),
  confirmOnDelete: z.boolean().default(true),
  showGrid: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;

import { z } from 'zod';
export declare const SettingsSchema: z.ZodObject<{
    autosave: z.ZodDefault<z.ZodBoolean>;
    autosaveIntervalSeconds: z.ZodDefault<z.ZodNumber>;
    defaultExportFormat: z.ZodDefault<z.ZodEnum<["png", "svg"]>>;
    confirmOnDelete: z.ZodDefault<z.ZodBoolean>;
    showGrid: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    autosave: boolean;
    autosaveIntervalSeconds: number;
    defaultExportFormat: "png" | "svg";
    confirmOnDelete: boolean;
    showGrid: boolean;
}, {
    autosave?: boolean | undefined;
    autosaveIntervalSeconds?: number | undefined;
    defaultExportFormat?: "png" | "svg" | undefined;
    confirmOnDelete?: boolean | undefined;
    showGrid?: boolean | undefined;
}>;
export type Settings = z.infer<typeof SettingsSchema>;

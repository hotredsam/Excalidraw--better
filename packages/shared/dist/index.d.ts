export * from './config';
import { z } from 'zod';
export declare const AppPingSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    version: z.ZodString;
    platform: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    version: string;
    platform: string;
}, {
    ok: boolean;
    version: string;
    platform: string;
}>;
export declare const ProfileSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    lastOpenedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    lastOpenedAt: number;
}, {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    lastOpenedAt: number;
}>;
export declare const ProfileListSchema: z.ZodObject<{
    profiles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        lastOpenedAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: number;
        updatedAt: number;
        lastOpenedAt: number;
    }, {
        id: string;
        name: string;
        createdAt: number;
        updatedAt: number;
        lastOpenedAt: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    profiles: {
        id: string;
        name: string;
        createdAt: number;
        updatedAt: number;
        lastOpenedAt: number;
    }[];
}, {
    profiles: {
        id: string;
        name: string;
        createdAt: number;
        updatedAt: number;
        lastOpenedAt: number;
    }[];
}>;
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
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

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
export declare const WorkspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    lastOpenedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    path: string;
    id: string;
    name: string;
    lastOpenedAt: number;
}, {
    path: string;
    id: string;
    name: string;
    lastOpenedAt: number;
}>;
export declare const WorkspaceListSchema: z.ZodObject<{
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        path: z.ZodString;
        lastOpenedAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        path: string;
        id: string;
        name: string;
        lastOpenedAt: number;
    }, {
        path: string;
        id: string;
        name: string;
        lastOpenedAt: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    workspaces: {
        path: string;
        id: string;
        name: string;
        lastOpenedAt: number;
    }[];
}, {
    workspaces: {
        path: string;
        id: string;
        name: string;
        lastOpenedAt: number;
    }[];
}>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceList = z.infer<typeof WorkspaceListSchema>;
export declare const FileInfoSchema: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    isDirectory: z.ZodBoolean;
    size: z.ZodNumber;
    mtime: z.ZodNumber;
    extension: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    name: string;
    isDirectory: boolean;
    size: number;
    mtime: number;
    extension?: string | undefined;
}, {
    path: string;
    name: string;
    isDirectory: boolean;
    size: number;
    mtime: number;
    extension?: string | undefined;
}>;
export type FileInfo = z.infer<typeof FileInfoSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

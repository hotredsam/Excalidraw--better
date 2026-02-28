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
export declare const ExcalidrawFileSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    source: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    appState: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    files: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    source: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    appState: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    files: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    source: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    appState: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    files: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, z.ZodTypeAny, "passthrough">>;
export type FileInfo = z.infer<typeof FileInfoSchema>;
export type ExcalidrawFile = z.infer<typeof ExcalidrawFileSchema>;
export declare function mergeExcalidraw(existing: any, elements: any[], appState: any): ExcalidrawFile;
export declare const PluginInfoSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    enabled: z.ZodBoolean;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    path: string;
    id: string;
    name: string;
    enabled: boolean;
    description?: string | undefined;
    author?: string | undefined;
}, {
    version: string;
    path: string;
    id: string;
    name: string;
    enabled: boolean;
    description?: string | undefined;
    author?: string | undefined;
}>;
export declare const PluginListSchema: z.ZodObject<{
    plugins: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        enabled: z.ZodBoolean;
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version: string;
        path: string;
        id: string;
        name: string;
        enabled: boolean;
        description?: string | undefined;
        author?: string | undefined;
    }, {
        version: string;
        path: string;
        id: string;
        name: string;
        enabled: boolean;
        description?: string | undefined;
        author?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    plugins: {
        version: string;
        path: string;
        id: string;
        name: string;
        enabled: boolean;
        description?: string | undefined;
        author?: string | undefined;
    }[];
}, {
    plugins: {
        version: string;
        path: string;
        id: string;
        name: string;
        enabled: boolean;
        description?: string | undefined;
        author?: string | undefined;
    }[];
}>;
export type PluginInfo = z.infer<typeof PluginInfoSchema>;
export type PluginList = z.infer<typeof PluginListSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

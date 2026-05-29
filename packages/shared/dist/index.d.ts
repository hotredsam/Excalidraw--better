export * from './config';
import { z } from 'zod';
export declare const AppPingSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    version: z.ZodString;
    platform: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    ok: boolean;
    platform: string;
}, {
    version: string;
    ok: boolean;
    platform: string;
}>;
export type AppPing = z.infer<typeof AppPingSchema>;
export declare const ProfileSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    lastOpenedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    updatedAt: number;
    createdAt: number;
    lastOpenedAt: number;
}, {
    id: string;
    name: string;
    updatedAt: number;
    createdAt: number;
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
        updatedAt: number;
        createdAt: number;
        lastOpenedAt: number;
    }, {
        id: string;
        name: string;
        updatedAt: number;
        createdAt: number;
        lastOpenedAt: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    profiles: {
        id: string;
        name: string;
        updatedAt: number;
        createdAt: number;
        lastOpenedAt: number;
    }[];
}, {
    profiles: {
        id: string;
        name: string;
        updatedAt: number;
        createdAt: number;
        lastOpenedAt: number;
    }[];
}>;
export { SettingsSchema } from './settings-schema';
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
    size: number;
    mtime: number;
    isDirectory: boolean;
    extension?: string | undefined;
}, {
    path: string;
    name: string;
    size: number;
    mtime: number;
    isDirectory: boolean;
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
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileList = z.infer<typeof ProfileListSchema>;
export type { Settings } from './settings-schema';
export * from './plugins';
export * from './ai-import';
export * from './search';
export * from './templates';
export * from './features';
export * from './feature-utils';
export * from './features2';
export * from './feature-utils2';
export * from './utils';
export * from './colors';
export * from './frontmatter';
export * from './styles';
export * from './text';
export * from './validation';
export * from './geometry';
export * from './scene-utils';
export * from './collections';

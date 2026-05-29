import { z } from 'zod';
export declare const SnippetSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    createdAt: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    tags: string[];
    elements: any[];
    createdAt: number;
}, {
    id: string;
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    elements?: any[] | undefined;
    createdAt?: number | undefined;
}>;
export declare const SnippetSummarySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    createdAt: z.ZodDefault<z.ZodNumber>;
}, "elements">, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    tags: string[];
    createdAt: number;
}, {
    id: string;
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    createdAt?: number | undefined;
}>;
export declare const SnippetListSchema: z.ZodObject<{
    snippets: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
        createdAt: z.ZodDefault<z.ZodNumber>;
    }, "elements">, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        tags: string[];
        createdAt: number;
    }, {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        createdAt?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    snippets: {
        id: string;
        title: string;
        description: string;
        tags: string[];
        createdAt: number;
    }[];
}, {
    snippets: {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        createdAt?: number | undefined;
    }[];
}>;
export type Snippet = z.infer<typeof SnippetSchema>;
export type SnippetSummary = z.infer<typeof SnippetSummarySchema>;
export type SnippetList = z.infer<typeof SnippetListSchema>;
export declare const ShortcutBindingSchema: z.ZodObject<{
    commandId: z.ZodString;
    accelerator: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accelerator: string;
    commandId: string;
}, {
    accelerator: string;
    commandId: string;
}>;
export declare const ShortcutMapSchema: z.ZodObject<{
    bindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        commandId: z.ZodString;
        accelerator: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        accelerator: string;
        commandId: string;
    }, {
        accelerator: string;
        commandId: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    bindings: {
        accelerator: string;
        commandId: string;
    }[];
}, {
    bindings?: {
        accelerator: string;
        commandId: string;
    }[] | undefined;
}>;
export type ShortcutBinding = z.infer<typeof ShortcutBindingSchema>;
export type ShortcutMap = z.infer<typeof ShortcutMapSchema>;
/** Default command → accelerator bindings (used when the user hasn't customised). */
export declare const DEFAULT_SHORTCUTS: ShortcutBinding[];
export declare const WorkspaceConfigSchema: z.ZodObject<{
    defaultTags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    excludeGlobs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    autoIndex: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    defaultTags: string[];
    excludeGlobs: string[];
    autoIndex: boolean;
}, {
    defaultTags?: string[] | undefined;
    excludeGlobs?: string[] | undefined;
    autoIndex?: boolean | undefined;
}>;
export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>;

import { z } from 'zod';
export declare const StoredTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    scene: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    tags: string[];
    scene: Record<string, any>;
}, {
    id: string;
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    scene?: Record<string, any> | undefined;
}>;
export declare const TemplateSummarySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    scene: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "scene">, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    tags: string[];
}, {
    id: string;
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const TemplateListSchema: z.ZodObject<{
    templates: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        scene: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "scene">, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        tags: string[];
    }, {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    templates: {
        id: string;
        title: string;
        description: string;
        tags: string[];
    }[];
}, {
    templates: {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
}>;
export type StoredTemplate = z.infer<typeof StoredTemplateSchema>;
export type TemplateSummary = z.infer<typeof TemplateSummarySchema>;
export type TemplateList = z.infer<typeof TemplateListSchema>;

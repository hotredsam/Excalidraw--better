import { z } from 'zod';
export const StoredTemplateSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    scene: z.record(z.any()).default({}),
});
export const TemplateSummarySchema = StoredTemplateSchema.omit({ scene: true });
export const TemplateListSchema = z.object({
    templates: z.array(TemplateSummarySchema),
});

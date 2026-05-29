"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateListSchema = exports.TemplateSummarySchema = exports.StoredTemplateSchema = void 0;
const zod_1 = require("zod");
exports.StoredTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().default(''),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    scene: zod_1.z.record(zod_1.z.any()).default({}),
});
exports.TemplateSummarySchema = exports.StoredTemplateSchema.omit({ scene: true });
exports.TemplateListSchema = zod_1.z.object({
    templates: zod_1.z.array(exports.TemplateSummarySchema),
});

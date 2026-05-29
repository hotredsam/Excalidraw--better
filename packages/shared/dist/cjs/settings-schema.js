"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = exports.ThemeSchema = void 0;
const zod_1 = require("zod");
exports.ThemeSchema = zod_1.z.enum(['dark', 'light', 'system']).default('dark');
exports.SettingsSchema = zod_1.z.object({
    // Editing
    autosave: zod_1.z.boolean().default(true),
    autosaveIntervalSeconds: zod_1.z.number().min(2).max(600).default(15),
    showGrid: zod_1.z.boolean().default(false),
    theme: exports.ThemeSchema,
    // Files
    defaultExportFormat: zod_1.z.enum(['png', 'svg']).default('png'),
    confirmOnDelete: zod_1.z.boolean().default(true),
    recentsLimit: zod_1.z.number().min(1).max(100).default(20),
    // Safety / history
    keepBackups: zod_1.z.boolean().default(true),
    backupsToKeep: zod_1.z.number().min(1).max(50).default(10),
    // Workspace
    autoOpenLastWorkspace: zod_1.z.boolean().default(true),
    indexEmbeddedText: zod_1.z.boolean().default(true),
});

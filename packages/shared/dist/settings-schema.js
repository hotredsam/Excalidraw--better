"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = void 0;
const zod_1 = require("zod");
exports.SettingsSchema = zod_1.z.object({
    autosave: zod_1.z.boolean().default(true),
    autosaveIntervalSeconds: zod_1.z.number().default(15),
    defaultExportFormat: zod_1.z.enum(['png', 'svg']).default('png'),
    confirmOnDelete: zod_1.z.boolean().default(true),
    showGrid: zod_1.z.boolean().default(false),
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = exports.ProfileListSchema = exports.ProfileSchema = exports.AppPingSchema = void 0;
__exportStar(require("./config"), exports);
const zod_1 = require("zod");
exports.AppPingSchema = zod_1.z.object({
    ok: zod_1.z.boolean(),
    version: zod_1.z.string(),
    platform: zod_1.z.string(),
});
exports.ProfileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    createdAt: zod_1.z.number(),
    updatedAt: zod_1.z.number(),
    lastOpenedAt: zod_1.z.number(),
});
exports.ProfileListSchema = zod_1.z.object({
    profiles: zod_1.z.array(exports.ProfileSchema),
});
exports.SettingsSchema = zod_1.z.object({
    autosave: zod_1.z.boolean().default(true),
    autosaveIntervalSeconds: zod_1.z.number().default(15),
    defaultExportFormat: zod_1.z.enum(['png', 'svg']).default('png'),
    confirmOnDelete: zod_1.z.boolean().default(true),
    showGrid: zod_1.z.boolean().default(false),
});

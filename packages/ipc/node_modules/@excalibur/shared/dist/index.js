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
exports.PluginListSchema = exports.PluginInfoSchema = exports.ExcalidrawFileSchema = exports.FileInfoSchema = exports.WorkspaceListSchema = exports.WorkspaceSchema = exports.SettingsSchema = exports.ProfileListSchema = exports.ProfileSchema = exports.AppPingSchema = void 0;
exports.mergeExcalidraw = mergeExcalidraw;
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
exports.WorkspaceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    lastOpenedAt: zod_1.z.number(),
});
exports.WorkspaceListSchema = zod_1.z.object({
    workspaces: zod_1.z.array(exports.WorkspaceSchema),
});
exports.FileInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    isDirectory: zod_1.z.boolean(),
    size: zod_1.z.number(),
    mtime: zod_1.z.number(),
    extension: zod_1.z.string().optional(),
});
exports.ExcalidrawFileSchema = zod_1.z.object({
    type: zod_1.z.string().default('excalidraw'),
    version: zod_1.z.number().optional().default(2),
    source: zod_1.z.string().optional().default('https://excalidraw.com'),
    elements: zod_1.z.array(zod_1.z.any()).default([]),
    appState: zod_1.z.record(zod_1.z.any()).optional().default({}),
    files: zod_1.z.record(zod_1.z.any()).optional().default({}),
}).passthrough();
function mergeExcalidraw(existing, elements, appState) {
    const merged = {
        ...existing,
        elements,
        appState: {
            ...(existing.appState || {}),
            ...appState
        }
    };
    return exports.ExcalidrawFileSchema.parse(merged);
}
exports.PluginInfoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    version: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean(),
    path: zod_1.z.string(),
});
exports.PluginListSchema = zod_1.z.object({
    plugins: zod_1.z.array(exports.PluginInfoSchema),
});

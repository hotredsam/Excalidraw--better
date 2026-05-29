"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginListSchema = exports.InstalledPluginSchema = exports.PluginManifestSchema = exports.PluginContributesSchema = exports.PluginPanelSchema = exports.PluginCommandSchema = exports.ExportPresetSchema = exports.PluginPermissionsSchema = void 0;
const zod_1 = require("zod");
/**
 * Plugin permission model. Plugins declare what they need; the host enforces it.
 * Excalibur plugins are *declarative*: a manifest describes contributions
 * (toolbar buttons, commands, panels, export presets) that the host renders and
 * executes through a permission-gated API surface. This keeps the renderer
 * sandbox intact — we never `eval` arbitrary plugin code with full privileges.
 */
exports.PluginPermissionsSchema = zod_1.z.object({
    filesystem: zod_1.z.enum(['none', 'workspace-only', 'all']).default('none'),
    network: zod_1.z.enum(['none', 'all']).default('none'),
});
exports.ExportPresetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    format: zod_1.z.enum(['png', 'svg', 'json']),
    scale: zod_1.z.number().min(0.1).max(10).default(1),
    background: zod_1.z.boolean().default(true),
    darkMode: zod_1.z.boolean().default(false),
    /** Output filename template, e.g. "{name}-{preset}". */
    nameTemplate: zod_1.z.string().default('{name}'),
});
exports.PluginCommandSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    /** Optional keyboard accelerator hint shown in the command palette. */
    accelerator: zod_1.z.string().optional(),
});
exports.PluginPanelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    /** Markdown rendered inside the panel (declarative panels only). */
    body: zod_1.z.string().optional(),
});
exports.PluginContributesSchema = zod_1.z.object({
    toolbar: zod_1.z.array(exports.PluginCommandSchema).default([]),
    commands: zod_1.z.array(exports.PluginCommandSchema).default([]),
    panels: zod_1.z.array(exports.PluginPanelSchema).default([]),
    exportPresets: zod_1.z.array(exports.ExportPresetSchema).default([]),
});
exports.PluginManifestSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .regex(/^[a-z0-9][a-z0-9-]*$/, 'id must be kebab-case alphanumeric'),
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    description: zod_1.z.string().default(''),
    author: zod_1.z.string().optional(),
    permissions: exports.PluginPermissionsSchema.default({}),
    contributes: exports.PluginContributesSchema.default({}),
});
exports.InstalledPluginSchema = exports.PluginManifestSchema.extend({
    enabled: zod_1.z.boolean().default(false),
    installedAt: zod_1.z.number(),
    /** Whether this plugin shipped with the app (cannot be uninstalled). */
    builtIn: zod_1.z.boolean().default(false),
});
exports.PluginListSchema = zod_1.z.object({
    plugins: zod_1.z.array(exports.InstalledPluginSchema),
});

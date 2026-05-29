import { z } from 'zod';
/**
 * Plugin permission model. Plugins declare what they need; the host enforces it.
 * Excalibur plugins are *declarative*: a manifest describes contributions
 * (toolbar buttons, commands, panels, export presets) that the host renders and
 * executes through a permission-gated API surface. This keeps the renderer
 * sandbox intact — we never `eval` arbitrary plugin code with full privileges.
 */
export const PluginPermissionsSchema = z.object({
    filesystem: z.enum(['none', 'workspace-only', 'all']).default('none'),
    network: z.enum(['none', 'all']).default('none'),
});
export const ExportPresetSchema = z.object({
    id: z.string(),
    label: z.string(),
    format: z.enum(['png', 'svg', 'json']),
    scale: z.number().min(0.1).max(10).default(1),
    background: z.boolean().default(true),
    darkMode: z.boolean().default(false),
    /** Output filename template, e.g. "{name}-{preset}". */
    nameTemplate: z.string().default('{name}'),
});
export const PluginCommandSchema = z.object({
    id: z.string(),
    title: z.string(),
    /** Optional keyboard accelerator hint shown in the command palette. */
    accelerator: z.string().optional(),
});
export const PluginPanelSchema = z.object({
    id: z.string(),
    title: z.string(),
    /** Markdown rendered inside the panel (declarative panels only). */
    body: z.string().optional(),
});
export const PluginContributesSchema = z.object({
    toolbar: z.array(PluginCommandSchema).default([]),
    commands: z.array(PluginCommandSchema).default([]),
    panels: z.array(PluginPanelSchema).default([]),
    exportPresets: z.array(ExportPresetSchema).default([]),
});
export const PluginManifestSchema = z.object({
    id: z
        .string()
        .regex(/^[a-z0-9][a-z0-9-]*$/, 'id must be kebab-case alphanumeric'),
    name: z.string().min(1),
    version: z.string().min(1),
    description: z.string().default(''),
    author: z.string().optional(),
    permissions: PluginPermissionsSchema.default({}),
    contributes: PluginContributesSchema.default({}),
});
export const InstalledPluginSchema = PluginManifestSchema.extend({
    enabled: z.boolean().default(false),
    installedAt: z.number(),
    /** Whether this plugin shipped with the app (cannot be uninstalled). */
    builtIn: z.boolean().default(false),
});
export const PluginListSchema = z.object({
    plugins: z.array(InstalledPluginSchema),
});

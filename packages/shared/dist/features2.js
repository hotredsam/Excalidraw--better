"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceConfigSchema = exports.DEFAULT_SHORTCUTS = exports.ShortcutMapSchema = exports.ShortcutBindingSchema = exports.SnippetListSchema = exports.SnippetSummarySchema = exports.SnippetSchema = void 0;
const zod_1 = require("zod");
// ─────────────────────────────────────────────────────────────────────────
// Snippets (quick-insert element groups)
// ─────────────────────────────────────────────────────────────────────────
exports.SnippetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().default(''),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    elements: zod_1.z.array(zod_1.z.any()).default([]),
    createdAt: zod_1.z.number().default(() => Date.now()),
});
exports.SnippetSummarySchema = exports.SnippetSchema.omit({ elements: true });
exports.SnippetListSchema = zod_1.z.object({ snippets: zod_1.z.array(exports.SnippetSummarySchema) });
// ─────────────────────────────────────────────────────────────────────────
// Keyboard shortcut customization
// ─────────────────────────────────────────────────────────────────────────
exports.ShortcutBindingSchema = zod_1.z.object({
    commandId: zod_1.z.string(),
    accelerator: zod_1.z.string(), // normalized, e.g. "Ctrl+Shift+P"
});
exports.ShortcutMapSchema = zod_1.z.object({
    bindings: zod_1.z.array(exports.ShortcutBindingSchema).default([]),
});
/** Default command → accelerator bindings (used when the user hasn't customised). */
exports.DEFAULT_SHORTCUTS = [
    { commandId: 'core.command-palette', accelerator: 'Ctrl+K' },
    { commandId: 'core.save', accelerator: 'Ctrl+S' },
    { commandId: 'core.save-as', accelerator: 'Ctrl+Shift+S' },
    { commandId: 'core.new', accelerator: 'Ctrl+N' },
    { commandId: 'core.export', accelerator: 'Ctrl+P' },
    { commandId: 'core.search', accelerator: 'Ctrl+F' },
    { commandId: 'core.toggle-plugins', accelerator: 'Ctrl+Shift+P' },
    { commandId: 'core.toggle-ai', accelerator: 'Ctrl+I' },
    { commandId: 'core.import-image', accelerator: 'Ctrl+Shift+I' },
    { commandId: 'core.presentation', accelerator: 'F5' },
];
// ─────────────────────────────────────────────────────────────────────────
// Per-workspace configuration
// ─────────────────────────────────────────────────────────────────────────
exports.WorkspaceConfigSchema = zod_1.z.object({
    defaultTags: zod_1.z.array(zod_1.z.string()).default([]),
    excludeGlobs: zod_1.z.array(zod_1.z.string()).default([]),
    autoIndex: zod_1.z.boolean().default(true),
});

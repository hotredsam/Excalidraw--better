import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────
// Snippets (quick-insert element groups)
// ─────────────────────────────────────────────────────────────────────────
export const SnippetSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    elements: z.array(z.any()).default([]),
    createdAt: z.number().default(() => Date.now()),
});
export const SnippetSummarySchema = SnippetSchema.omit({ elements: true });
export const SnippetListSchema = z.object({ snippets: z.array(SnippetSummarySchema) });
// ─────────────────────────────────────────────────────────────────────────
// Keyboard shortcut customization
// ─────────────────────────────────────────────────────────────────────────
export const ShortcutBindingSchema = z.object({
    commandId: z.string(),
    accelerator: z.string(), // normalized, e.g. "Ctrl+Shift+P"
});
export const ShortcutMapSchema = z.object({
    bindings: z.array(ShortcutBindingSchema).default([]),
});
/** Default command → accelerator bindings (used when the user hasn't customised). */
export const DEFAULT_SHORTCUTS = [
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
export const WorkspaceConfigSchema = z.object({
    defaultTags: z.array(z.string()).default([]),
    excludeGlobs: z.array(z.string()).default([]),
    autoIndex: z.boolean().default(true),
});

import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────
// Recent files (per profile)
// ─────────────────────────────────────────────────────────────────────────
export const RecentFileSchema = z.object({
    path: z.string(),
    name: z.string(),
    workspaceId: z.string(),
    workspaceName: z.string(),
    openedAt: z.number(),
});
export const RecentFileListSchema = z.object({ recents: z.array(RecentFileSchema) });
// ─────────────────────────────────────────────────────────────────────────
// Libraries (.excalidrawlib)
// ─────────────────────────────────────────────────────────────────────────
export const LibraryItemSchema = z
    .object({
    id: z.string().optional(),
    status: z.string().optional(),
    created: z.number().optional(),
    name: z.string().optional(),
    elements: z.array(z.any()).default([]),
})
    .passthrough();
export const LibrarySchema = z.object({
    type: z.literal('excalidrawlib').default('excalidrawlib'),
    version: z.number().default(2),
    source: z.string().default('excalibur'),
    libraryItems: z.array(LibraryItemSchema).default([]),
});
export const LibrarySummarySchema = z.object({
    id: z.string(),
    name: z.string(),
    itemCount: z.number(),
    updatedAt: z.number(),
});
export const LibraryListSchema = z.object({ libraries: z.array(LibrarySummarySchema) });
// ─────────────────────────────────────────────────────────────────────────
// Bulk operations (guardrailed)
// ─────────────────────────────────────────────────────────────────────────
export const BulkRenameOptionsSchema = z.object({
    /** Template using {name}, {ext}, {n}, {date}. */
    template: z.string().default('{name}'),
    /** Starting index for {n}. */
    startIndex: z.number().default(1),
    /** Zero-pad width for {n}. */
    padWidth: z.number().min(0).max(8).default(0),
});
export const BulkResultSchema = z.object({
    ok: z.boolean(),
    processed: z.number(),
    failed: z.number(),
    details: z.array(z.object({ path: z.string(), result: z.string(), error: z.string().optional() })),
});
// ─────────────────────────────────────────────────────────────────────────
// Presentation mode (frames → slides)
// ─────────────────────────────────────────────────────────────────────────
export const SlideSchema = z.object({
    id: z.string(),
    name: z.string(),
    index: z.number(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    notes: z.string().default(''),
});
export const SlideDeckSchema = z.object({ slides: z.array(SlideSchema) });
// ─────────────────────────────────────────────────────────────────────────
// Review mode (local comment pins)
// ─────────────────────────────────────────────────────────────────────────
export const CommentSchema = z.object({
    id: z.string(),
    author: z.string(),
    body: z.string(),
    createdAt: z.number(),
});
export const PinSchema = z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    resolved: z.boolean().default(false),
    comments: z.array(CommentSchema).default([]),
});
export const ReviewSchema = z.object({ pins: z.array(PinSchema).default([]) });
// ─────────────────────────────────────────────────────────────────────────
// Workspace stats / dashboard
// ─────────────────────────────────────────────────────────────────────────
export const WorkspaceStatsSchema = z.object({
    totalFiles: z.number(),
    byExtension: z.record(z.number()),
    totalBytes: z.number(),
    totalElements: z.number(),
    tagHistogram: z.record(z.number()),
    largestFiles: z.array(z.object({ name: z.string(), path: z.string(), size: z.number() })),
    recentlyModified: z.array(z.object({ name: z.string(), path: z.string(), mtime: z.number() })),
});
// ─────────────────────────────────────────────────────────────────────────
// Git helper (permission-gated)
// ─────────────────────────────────────────────────────────────────────────
export const GitFileStatusSchema = z.object({
    path: z.string(),
    index: z.string(),
    working: z.string(),
});
export const GitStatusSchema = z.object({
    isRepo: z.boolean(),
    branch: z.string().optional(),
    ahead: z.number().default(0),
    behind: z.number().default(0),
    files: z.array(GitFileStatusSchema).default([]),
    clean: z.boolean().default(true),
});
// ─────────────────────────────────────────────────────────────────────────
// Command palette
// ─────────────────────────────────────────────────────────────────────────
export const CommandSchema = z.object({
    id: z.string(),
    title: z.string(),
    category: z.string().default('General'),
    accelerator: z.string().optional(),
    source: z.string().default('core'),
});
// ─────────────────────────────────────────────────────────────────────────
// Backups
// ─────────────────────────────────────────────────────────────────────────
export const BackupEntrySchema = z.object({
    id: z.string(),
    originalPath: z.string(),
    backupPath: z.string(),
    createdAt: z.number(),
    size: z.number(),
});
export const BackupListSchema = z.object({ backups: z.array(BackupEntrySchema) });
// ─────────────────────────────────────────────────────────────────────────
// Markdown export
// ─────────────────────────────────────────────────────────────────────────
export const MarkdownOptionsSchema = z.object({
    includeFrontmatter: z.boolean().default(true),
    imageFormat: z.enum(['png', 'svg']).default('png'),
    title: z.string().optional(),
    tags: z.array(z.string()).default([]),
});

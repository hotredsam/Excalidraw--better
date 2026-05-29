"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownOptionsSchema = exports.BackupListSchema = exports.BackupEntrySchema = exports.CommandSchema = exports.GitStatusSchema = exports.GitFileStatusSchema = exports.WorkspaceStatsSchema = exports.ReviewSchema = exports.PinSchema = exports.CommentSchema = exports.SlideDeckSchema = exports.SlideSchema = exports.BulkResultSchema = exports.BulkRenameOptionsSchema = exports.LibraryListSchema = exports.LibrarySummarySchema = exports.LibrarySchema = exports.LibraryItemSchema = exports.RecentFileListSchema = exports.RecentFileSchema = void 0;
const zod_1 = require("zod");
// ─────────────────────────────────────────────────────────────────────────
// Recent files (per profile)
// ─────────────────────────────────────────────────────────────────────────
exports.RecentFileSchema = zod_1.z.object({
    path: zod_1.z.string(),
    name: zod_1.z.string(),
    workspaceId: zod_1.z.string(),
    workspaceName: zod_1.z.string(),
    openedAt: zod_1.z.number(),
});
exports.RecentFileListSchema = zod_1.z.object({ recents: zod_1.z.array(exports.RecentFileSchema) });
// ─────────────────────────────────────────────────────────────────────────
// Libraries (.excalidrawlib)
// ─────────────────────────────────────────────────────────────────────────
exports.LibraryItemSchema = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    created: zod_1.z.number().optional(),
    name: zod_1.z.string().optional(),
    elements: zod_1.z.array(zod_1.z.any()).default([]),
})
    .passthrough();
exports.LibrarySchema = zod_1.z.object({
    type: zod_1.z.literal('excalidrawlib').default('excalidrawlib'),
    version: zod_1.z.number().default(2),
    source: zod_1.z.string().default('excalibur'),
    libraryItems: zod_1.z.array(exports.LibraryItemSchema).default([]),
});
exports.LibrarySummarySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    itemCount: zod_1.z.number(),
    updatedAt: zod_1.z.number(),
});
exports.LibraryListSchema = zod_1.z.object({ libraries: zod_1.z.array(exports.LibrarySummarySchema) });
// ─────────────────────────────────────────────────────────────────────────
// Bulk operations (guardrailed)
// ─────────────────────────────────────────────────────────────────────────
exports.BulkRenameOptionsSchema = zod_1.z.object({
    /** Template using {name}, {ext}, {n}, {date}. */
    template: zod_1.z.string().default('{name}'),
    /** Starting index for {n}. */
    startIndex: zod_1.z.number().default(1),
    /** Zero-pad width for {n}. */
    padWidth: zod_1.z.number().min(0).max(8).default(0),
});
exports.BulkResultSchema = zod_1.z.object({
    ok: zod_1.z.boolean(),
    processed: zod_1.z.number(),
    failed: zod_1.z.number(),
    details: zod_1.z.array(zod_1.z.object({ path: zod_1.z.string(), result: zod_1.z.string(), error: zod_1.z.string().optional() })),
});
// ─────────────────────────────────────────────────────────────────────────
// Presentation mode (frames → slides)
// ─────────────────────────────────────────────────────────────────────────
exports.SlideSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    index: zod_1.z.number(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
    notes: zod_1.z.string().default(''),
});
exports.SlideDeckSchema = zod_1.z.object({ slides: zod_1.z.array(exports.SlideSchema) });
// ─────────────────────────────────────────────────────────────────────────
// Review mode (local comment pins)
// ─────────────────────────────────────────────────────────────────────────
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    author: zod_1.z.string(),
    body: zod_1.z.string(),
    createdAt: zod_1.z.number(),
});
exports.PinSchema = zod_1.z.object({
    id: zod_1.z.string(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    resolved: zod_1.z.boolean().default(false),
    comments: zod_1.z.array(exports.CommentSchema).default([]),
});
exports.ReviewSchema = zod_1.z.object({ pins: zod_1.z.array(exports.PinSchema).default([]) });
// ─────────────────────────────────────────────────────────────────────────
// Workspace stats / dashboard
// ─────────────────────────────────────────────────────────────────────────
exports.WorkspaceStatsSchema = zod_1.z.object({
    totalFiles: zod_1.z.number(),
    byExtension: zod_1.z.record(zod_1.z.number()),
    totalBytes: zod_1.z.number(),
    totalElements: zod_1.z.number(),
    tagHistogram: zod_1.z.record(zod_1.z.number()),
    largestFiles: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), path: zod_1.z.string(), size: zod_1.z.number() })),
    recentlyModified: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), path: zod_1.z.string(), mtime: zod_1.z.number() })),
});
// ─────────────────────────────────────────────────────────────────────────
// Git helper (permission-gated)
// ─────────────────────────────────────────────────────────────────────────
exports.GitFileStatusSchema = zod_1.z.object({
    path: zod_1.z.string(),
    index: zod_1.z.string(),
    working: zod_1.z.string(),
});
exports.GitStatusSchema = zod_1.z.object({
    isRepo: zod_1.z.boolean(),
    branch: zod_1.z.string().optional(),
    ahead: zod_1.z.number().default(0),
    behind: zod_1.z.number().default(0),
    files: zod_1.z.array(exports.GitFileStatusSchema).default([]),
    clean: zod_1.z.boolean().default(true),
});
// ─────────────────────────────────────────────────────────────────────────
// Command palette
// ─────────────────────────────────────────────────────────────────────────
exports.CommandSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    category: zod_1.z.string().default('General'),
    accelerator: zod_1.z.string().optional(),
    source: zod_1.z.string().default('core'),
});
// ─────────────────────────────────────────────────────────────────────────
// Backups
// ─────────────────────────────────────────────────────────────────────────
exports.BackupEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    originalPath: zod_1.z.string(),
    backupPath: zod_1.z.string(),
    createdAt: zod_1.z.number(),
    size: zod_1.z.number(),
});
exports.BackupListSchema = zod_1.z.object({ backups: zod_1.z.array(exports.BackupEntrySchema) });
// ─────────────────────────────────────────────────────────────────────────
// Markdown export
// ─────────────────────────────────────────────────────────────────────────
exports.MarkdownOptionsSchema = zod_1.z.object({
    includeFrontmatter: zod_1.z.boolean().default(true),
    imageFormat: zod_1.z.enum(['png', 'svg']).default('png'),
    title: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});

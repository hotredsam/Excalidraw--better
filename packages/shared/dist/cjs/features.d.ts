import { z } from 'zod';
export declare const RecentFileSchema: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodString;
    workspaceId: z.ZodString;
    workspaceName: z.ZodString;
    openedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    path: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
    openedAt: number;
}, {
    path: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
    openedAt: number;
}>;
export declare const RecentFileListSchema: z.ZodObject<{
    recents: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        name: z.ZodString;
        workspaceId: z.ZodString;
        workspaceName: z.ZodString;
        openedAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        path: string;
        name: string;
        workspaceId: string;
        workspaceName: string;
        openedAt: number;
    }, {
        path: string;
        name: string;
        workspaceId: string;
        workspaceName: string;
        openedAt: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recents: {
        path: string;
        name: string;
        workspaceId: string;
        workspaceName: string;
        openedAt: number;
    }[];
}, {
    recents: {
        path: string;
        name: string;
        workspaceId: string;
        workspaceName: string;
        openedAt: number;
    }[];
}>;
export type RecentFile = z.infer<typeof RecentFileSchema>;
export type RecentFileList = z.infer<typeof RecentFileListSchema>;
export declare const LibraryItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const LibrarySchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodLiteral<"excalidrawlib">>;
    version: z.ZodDefault<z.ZodNumber>;
    source: z.ZodDefault<z.ZodString>;
    libraryItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodString>;
        elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodString>;
        elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodString>;
        elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "excalidrawlib";
    version: number;
    source: string;
    libraryItems: z.objectOutputType<{
        id: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodString>;
        elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough">[];
}, {
    type?: "excalidrawlib" | undefined;
    version?: number | undefined;
    source?: string | undefined;
    libraryItems?: z.objectInputType<{
        id: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodString>;
        elements: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>;
export declare const LibrarySummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    itemCount: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    itemCount: number;
    updatedAt: number;
}, {
    id: string;
    name: string;
    itemCount: number;
    updatedAt: number;
}>;
export declare const LibraryListSchema: z.ZodObject<{
    libraries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        itemCount: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        itemCount: number;
        updatedAt: number;
    }, {
        id: string;
        name: string;
        itemCount: number;
        updatedAt: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    libraries: {
        id: string;
        name: string;
        itemCount: number;
        updatedAt: number;
    }[];
}, {
    libraries: {
        id: string;
        name: string;
        itemCount: number;
        updatedAt: number;
    }[];
}>;
export type LibraryItem = z.infer<typeof LibraryItemSchema>;
export type Library = z.infer<typeof LibrarySchema>;
export type LibrarySummary = z.infer<typeof LibrarySummarySchema>;
export type LibraryList = z.infer<typeof LibraryListSchema>;
export declare const BulkRenameOptionsSchema: z.ZodObject<{
    /** Template using {name}, {ext}, {n}, {date}. */
    template: z.ZodDefault<z.ZodString>;
    /** Starting index for {n}. */
    startIndex: z.ZodDefault<z.ZodNumber>;
    /** Zero-pad width for {n}. */
    padWidth: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    template: string;
    startIndex: number;
    padWidth: number;
}, {
    template?: string | undefined;
    startIndex?: number | undefined;
    padWidth?: number | undefined;
}>;
export declare const BulkResultSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    processed: z.ZodNumber;
    failed: z.ZodNumber;
    details: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        result: z.ZodString;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        result: string;
        error?: string | undefined;
    }, {
        path: string;
        result: string;
        error?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    processed: number;
    failed: number;
    details: {
        path: string;
        result: string;
        error?: string | undefined;
    }[];
}, {
    ok: boolean;
    processed: number;
    failed: number;
    details: {
        path: string;
        result: string;
        error?: string | undefined;
    }[];
}>;
export type BulkRenameOptions = z.infer<typeof BulkRenameOptionsSchema>;
export type BulkResult = z.infer<typeof BulkResultSchema>;
export declare const SlideSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    index: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    notes: string;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
}, {
    id: string;
    name: string;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    notes?: string | undefined;
}>;
export declare const SlideDeckSchema: z.ZodObject<{
    slides: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        index: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        notes: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        notes: string;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }, {
        id: string;
        name: string;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        notes?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    slides: {
        id: string;
        name: string;
        notes: string;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
}, {
    slides: {
        id: string;
        name: string;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        notes?: string | undefined;
    }[];
}>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideDeck = z.infer<typeof SlideDeckSchema>;
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodString;
    author: z.ZodString;
    body: z.ZodString;
    createdAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    author: string;
    createdAt: number;
}, {
    id: string;
    body: string;
    author: string;
    createdAt: number;
}>;
export declare const PinSchema: z.ZodObject<{
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    resolved: z.ZodDefault<z.ZodBoolean>;
    comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        author: z.ZodString;
        body: z.ZodString;
        createdAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        author: string;
        createdAt: number;
    }, {
        id: string;
        body: string;
        author: string;
        createdAt: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    x: number;
    y: number;
    resolved: boolean;
    comments: {
        id: string;
        body: string;
        author: string;
        createdAt: number;
    }[];
}, {
    id: string;
    x: number;
    y: number;
    resolved?: boolean | undefined;
    comments?: {
        id: string;
        body: string;
        author: string;
        createdAt: number;
    }[] | undefined;
}>;
export declare const ReviewSchema: z.ZodObject<{
    pins: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        resolved: z.ZodDefault<z.ZodBoolean>;
        comments: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            author: z.ZodString;
            body: z.ZodString;
            createdAt: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            body: string;
            author: string;
            createdAt: number;
        }, {
            id: string;
            body: string;
            author: string;
            createdAt: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        x: number;
        y: number;
        resolved: boolean;
        comments: {
            id: string;
            body: string;
            author: string;
            createdAt: number;
        }[];
    }, {
        id: string;
        x: number;
        y: number;
        resolved?: boolean | undefined;
        comments?: {
            id: string;
            body: string;
            author: string;
            createdAt: number;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    pins: {
        id: string;
        x: number;
        y: number;
        resolved: boolean;
        comments: {
            id: string;
            body: string;
            author: string;
            createdAt: number;
        }[];
    }[];
}, {
    pins?: {
        id: string;
        x: number;
        y: number;
        resolved?: boolean | undefined;
        comments?: {
            id: string;
            body: string;
            author: string;
            createdAt: number;
        }[] | undefined;
    }[] | undefined;
}>;
export type Comment = z.infer<typeof CommentSchema>;
export type Pin = z.infer<typeof PinSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export declare const WorkspaceStatsSchema: z.ZodObject<{
    totalFiles: z.ZodNumber;
    byExtension: z.ZodRecord<z.ZodString, z.ZodNumber>;
    totalBytes: z.ZodNumber;
    totalElements: z.ZodNumber;
    tagHistogram: z.ZodRecord<z.ZodString, z.ZodNumber>;
    largestFiles: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        path: string;
        name: string;
        size: number;
    }, {
        path: string;
        name: string;
        size: number;
    }>, "many">;
    recentlyModified: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        mtime: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        path: string;
        name: string;
        mtime: number;
    }, {
        path: string;
        name: string;
        mtime: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalFiles: number;
    byExtension: Record<string, number>;
    totalBytes: number;
    totalElements: number;
    tagHistogram: Record<string, number>;
    largestFiles: {
        path: string;
        name: string;
        size: number;
    }[];
    recentlyModified: {
        path: string;
        name: string;
        mtime: number;
    }[];
}, {
    totalFiles: number;
    byExtension: Record<string, number>;
    totalBytes: number;
    totalElements: number;
    tagHistogram: Record<string, number>;
    largestFiles: {
        path: string;
        name: string;
        size: number;
    }[];
    recentlyModified: {
        path: string;
        name: string;
        mtime: number;
    }[];
}>;
export type WorkspaceStats = z.infer<typeof WorkspaceStatsSchema>;
export declare const GitFileStatusSchema: z.ZodObject<{
    path: z.ZodString;
    index: z.ZodString;
    working: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    index: string;
    working: string;
}, {
    path: string;
    index: string;
    working: string;
}>;
export declare const GitStatusSchema: z.ZodObject<{
    isRepo: z.ZodBoolean;
    branch: z.ZodOptional<z.ZodString>;
    ahead: z.ZodDefault<z.ZodNumber>;
    behind: z.ZodDefault<z.ZodNumber>;
    files: z.ZodDefault<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        index: z.ZodString;
        working: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
        index: string;
        working: string;
    }, {
        path: string;
        index: string;
        working: string;
    }>, "many">>;
    clean: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isRepo: boolean;
    ahead: number;
    behind: number;
    files: {
        path: string;
        index: string;
        working: string;
    }[];
    clean: boolean;
    branch?: string | undefined;
}, {
    isRepo: boolean;
    branch?: string | undefined;
    ahead?: number | undefined;
    behind?: number | undefined;
    files?: {
        path: string;
        index: string;
        working: string;
    }[] | undefined;
    clean?: boolean | undefined;
}>;
export type GitFileStatus = z.infer<typeof GitFileStatusSchema>;
export type GitStatus = z.infer<typeof GitStatusSchema>;
export declare const CommandSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    category: z.ZodDefault<z.ZodString>;
    accelerator: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    source: string;
    category: string;
    accelerator?: string | undefined;
}, {
    id: string;
    title: string;
    accelerator?: string | undefined;
    source?: string | undefined;
    category?: string | undefined;
}>;
export type Command = z.infer<typeof CommandSchema>;
export declare const BackupEntrySchema: z.ZodObject<{
    id: z.ZodString;
    originalPath: z.ZodString;
    backupPath: z.ZodString;
    createdAt: z.ZodNumber;
    size: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: number;
    size: number;
    originalPath: string;
    backupPath: string;
}, {
    id: string;
    createdAt: number;
    size: number;
    originalPath: string;
    backupPath: string;
}>;
export declare const BackupListSchema: z.ZodObject<{
    backups: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        originalPath: z.ZodString;
        backupPath: z.ZodString;
        createdAt: z.ZodNumber;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: number;
        size: number;
        originalPath: string;
        backupPath: string;
    }, {
        id: string;
        createdAt: number;
        size: number;
        originalPath: string;
        backupPath: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    backups: {
        id: string;
        createdAt: number;
        size: number;
        originalPath: string;
        backupPath: string;
    }[];
}, {
    backups: {
        id: string;
        createdAt: number;
        size: number;
        originalPath: string;
        backupPath: string;
    }[];
}>;
export type BackupEntry = z.infer<typeof BackupEntrySchema>;
export type BackupList = z.infer<typeof BackupListSchema>;
export declare const MarkdownOptionsSchema: z.ZodObject<{
    includeFrontmatter: z.ZodDefault<z.ZodBoolean>;
    imageFormat: z.ZodDefault<z.ZodEnum<["png", "svg"]>>;
    title: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    includeFrontmatter: boolean;
    imageFormat: "png" | "svg";
    title?: string | undefined;
}, {
    title?: string | undefined;
    tags?: string[] | undefined;
    includeFrontmatter?: boolean | undefined;
    imageFormat?: "png" | "svg" | undefined;
}>;
export type MarkdownOptions = z.infer<typeof MarkdownOptionsSchema>;

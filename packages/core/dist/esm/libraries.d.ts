import { Library, LibrarySummary, LibraryItem } from '@excalibur/shared';
/**
 * Per-profile library store for Excalidraw `.excalidrawlib` packs. Libraries are
 * stored as `<profile>/libraries/<id>.excalidrawlib`. Supports import/export,
 * listing, and appending items captured from the canvas.
 */
export declare class LibraryStore {
    private dir;
    constructor(profileDir: string);
    init(): Promise<void>;
    private fileFor;
    list(): Promise<LibrarySummary[]>;
    get(id: string): Promise<Library>;
    save(id: string, library: Library): Promise<LibrarySummary>;
    /** Import a `.excalidrawlib` (or raw library JSON) from an absolute path. */
    importFromFile(srcPath: string, name?: string): Promise<LibrarySummary>;
    /** Append items to a library, creating it if needed. */
    addItems(id: string, items: LibraryItem[]): Promise<LibrarySummary>;
    remove(id: string): Promise<void>;
    /** Serialize a library to a JSON string for export/download. */
    exportJson(id: string): Promise<string>;
}

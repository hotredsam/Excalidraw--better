import { SearchResult, FileTags } from '@excalibur/shared';
export declare class SearchIndex {
    private workspacePath;
    private entries;
    private built;
    private cacheFile;
    private excludes;
    constructor(workspacePath: string);
    /** Set glob patterns (workspace-relative) to skip during indexing. */
    setExcludes(globs: string[]): void;
    ensureBuilt(force?: boolean): Promise<void>;
    /** Persist the current index to disk for a fast warm start next launch. */
    persist(): Promise<void>;
    /**
     * Load a previously-persisted index as a warm start (marks the index built so
     * searches answer immediately). Returns false if no usable cache exists.
     * Callers may still `ensureBuilt(true)` afterwards to refresh in the
     * background.
     */
    loadCache(): Promise<boolean>;
    private walk;
    private extractText;
    getTags(): Promise<FileTags>;
    setTags(filePath: string, tags: string[]): Promise<FileTags>;
    search(query: string): Promise<{
        results: SearchResult[];
        indexed: number;
    }>;
    invalidate(): void;
}
export declare function getIndex(workspacePath: string): SearchIndex;

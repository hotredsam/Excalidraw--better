import { RecentFile } from '@excalibur/shared';
/**
 * Per-profile recent-files list. Most-recent first, de-duplicated by path, and
 * capped at `limit`. Stored in `<profile>/recents/recents.json`.
 */
export declare class RecentsStore {
    private limit;
    private file;
    private recents;
    constructor(profileDir: string, limit?: number);
    init(): Promise<void>;
    setLimit(limit: number): void;
    list(): RecentFile[];
    add(entry: RecentFile): Promise<RecentFile[]>;
    remove(filePath: string): Promise<RecentFile[]>;
    /** Drop entries whose files no longer exist on disk. */
    prune(): Promise<RecentFile[]>;
    clear(): Promise<void>;
    private save;
}

import { BackupEntry } from '@excalibur/shared';
/**
 * Versioned, per-profile backups. Before overwriting a drawing, a timestamped
 * copy is stashed under `<profile>/backups/`, and an index is maintained so the
 * UI can list and restore previous versions. The number of retained backups per
 * original file is capped.
 */
export declare class BackupManager {
    private keepPerFile;
    private dir;
    private indexFile;
    private entries;
    constructor(profileDir: string, keepPerFile?: number);
    init(): Promise<void>;
    setKeep(keep: number): void;
    /** Snapshot a file before it is overwritten. No-op if the file doesn't exist. */
    backup(originalPath: string): Promise<BackupEntry | null>;
    private prune;
    list(originalPath?: string): BackupEntry[];
    restore(id: string, destPath?: string): Promise<string>;
    private save;
}

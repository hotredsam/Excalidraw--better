import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { writeJsonAtomic } from './fs-utils';
/**
 * Versioned, per-profile backups. Before overwriting a drawing, a timestamped
 * copy is stashed under `<profile>/backups/`, and an index is maintained so the
 * UI can list and restore previous versions. The number of retained backups per
 * original file is capped.
 */
export class BackupManager {
    keepPerFile;
    dir;
    indexFile;
    entries = [];
    constructor(profileDir, keepPerFile = 10) {
        this.keepPerFile = keepPerFile;
        this.dir = path.join(profileDir, 'backups');
        this.indexFile = path.join(this.dir, 'index.json');
    }
    async init() {
        await fs.ensureDir(this.dir);
        if (await fs.pathExists(this.indexFile)) {
            try {
                this.entries = await fs.readJson(this.indexFile);
            }
            catch {
                this.entries = [];
            }
        }
    }
    setKeep(keep) {
        this.keepPerFile = keep;
    }
    /** Snapshot a file before it is overwritten. No-op if the file doesn't exist. */
    async backup(originalPath) {
        if (!(await fs.pathExists(originalPath)))
            return null;
        const id = `${Date.now()}-${nanoid(6)}`;
        const base = path.basename(originalPath);
        const backupPath = path.join(this.dir, `${id}__${base}`);
        await fs.copy(originalPath, backupPath);
        const stat = await fs.stat(backupPath);
        const entry = { id, originalPath, backupPath, createdAt: Date.now(), size: stat.size };
        this.entries.push(entry);
        await this.prune(originalPath);
        await this.save();
        return entry;
    }
    async prune(originalPath) {
        const forFile = this.entries
            .filter((e) => e.originalPath === originalPath)
            .sort((a, b) => b.createdAt - a.createdAt);
        const excess = forFile.slice(this.keepPerFile);
        for (const e of excess) {
            await fs.remove(e.backupPath).catch(() => undefined);
            this.entries = this.entries.filter((x) => x.id !== e.id);
        }
    }
    list(originalPath) {
        const list = originalPath ? this.entries.filter((e) => e.originalPath === originalPath) : this.entries;
        return [...list].sort((a, b) => b.createdAt - a.createdAt);
    }
    async restore(id, destPath) {
        const entry = this.entries.find((e) => e.id === id);
        if (!entry)
            throw new Error('Backup not found');
        const target = destPath || entry.originalPath;
        await fs.copy(entry.backupPath, target, { overwrite: true });
        return target;
    }
    async save() {
        await writeJsonAtomic(this.indexFile, this.entries);
    }
}

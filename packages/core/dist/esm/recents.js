import * as path from 'path';
import * as fs from 'fs-extra';
import { writeJsonAtomic } from './fs-utils';
/**
 * Per-profile recent-files list. Most-recent first, de-duplicated by path, and
 * capped at `limit`. Stored in `<profile>/recents/recents.json`.
 */
export class RecentsStore {
    limit;
    file;
    recents = [];
    constructor(profileDir, limit = 20) {
        this.limit = limit;
        this.file = path.join(profileDir, 'recents', 'recents.json');
    }
    async init() {
        if (await fs.pathExists(this.file)) {
            try {
                this.recents = await fs.readJson(this.file);
            }
            catch {
                this.recents = [];
            }
        }
    }
    setLimit(limit) {
        this.limit = limit;
        if (this.recents.length > limit)
            this.recents = this.recents.slice(0, limit);
    }
    list() {
        return this.recents;
    }
    async add(entry) {
        this.recents = [entry, ...this.recents.filter((r) => r.path !== entry.path)].slice(0, this.limit);
        await this.save();
        return this.recents;
    }
    async remove(filePath) {
        this.recents = this.recents.filter((r) => r.path !== filePath);
        await this.save();
        return this.recents;
    }
    /** Drop entries whose files no longer exist on disk. */
    async prune() {
        const kept = [];
        for (const r of this.recents) {
            if (await fs.pathExists(r.path))
                kept.push(r);
        }
        this.recents = kept;
        await this.save();
        return this.recents;
    }
    async clear() {
        this.recents = [];
        await this.save();
    }
    async save() {
        await writeJsonAtomic(this.file, this.recents);
    }
}

import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { LibrarySchema } from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { writeJsonAtomic } from './fs-utils';
/**
 * Per-profile library store for Excalidraw `.excalidrawlib` packs. Libraries are
 * stored as `<profile>/libraries/<id>.excalidrawlib`. Supports import/export,
 * listing, and appending items captured from the canvas.
 */
export class LibraryStore {
    dir;
    constructor(profileDir) {
        this.dir = path.join(profileDir, 'libraries');
    }
    async init() {
        await fs.ensureDir(this.dir);
    }
    fileFor(id) {
        return path.join(this.dir, `${sanitizeName(id)}.excalidrawlib`);
    }
    async list() {
        await this.init();
        const files = (await fs.readdir(this.dir)).filter((f) => f.endsWith('.excalidrawlib'));
        const out = [];
        for (const f of files) {
            const full = path.join(this.dir, f);
            try {
                const lib = LibrarySchema.parse(await fs.readJson(full));
                const stat = await fs.stat(full);
                out.push({
                    id: f.replace(/\.excalidrawlib$/, ''),
                    name: f.replace(/\.excalidrawlib$/, ''),
                    itemCount: lib.libraryItems.length,
                    updatedAt: stat.mtimeMs,
                });
            }
            catch {
                // skip malformed library
            }
        }
        return out.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    async get(id) {
        const file = this.fileFor(id);
        if (!(await fs.pathExists(file)))
            throw new Error(`Library "${id}" not found`);
        return LibrarySchema.parse(await fs.readJson(file));
    }
    async save(id, library) {
        await this.init();
        const parsed = LibrarySchema.parse(library);
        await writeJsonAtomic(this.fileFor(id), parsed);
        return { id: sanitizeName(id), name: sanitizeName(id), itemCount: parsed.libraryItems.length, updatedAt: Date.now() };
    }
    /** Import a `.excalidrawlib` (or raw library JSON) from an absolute path. */
    async importFromFile(srcPath, name) {
        const raw = await fs.readJson(srcPath);
        const lib = LibrarySchema.parse(raw);
        const id = sanitizeName(name || path.basename(srcPath).replace(/\.excalidrawlib$/, '')) || nanoid(6);
        return this.save(id, lib);
    }
    /** Append items to a library, creating it if needed. */
    async addItems(id, items) {
        let lib;
        try {
            lib = await this.get(id);
        }
        catch {
            lib = LibrarySchema.parse({ libraryItems: [] });
        }
        lib.libraryItems = [...lib.libraryItems, ...items];
        return this.save(id, lib);
    }
    async remove(id) {
        const file = this.fileFor(id);
        if (await fs.pathExists(file))
            await fs.remove(file);
    }
    /** Serialize a library to a JSON string for export/download. */
    async exportJson(id) {
        const lib = await this.get(id);
        return JSON.stringify(lib, null, 2);
    }
}

import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { SnippetSchema } from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { writeJsonAtomic } from './fs-utils';
/**
 * Per-profile snippet library: small reusable groups of elements that can be
 * quick-inserted onto the canvas. Stored under `<profile>/snippets/<id>.json`.
 */
export class SnippetStore {
    dir;
    constructor(profileDir) {
        this.dir = path.join(profileDir, 'snippets');
    }
    async init() {
        await fs.ensureDir(this.dir);
    }
    fileFor(id) {
        return path.join(this.dir, `${sanitizeName(id)}.json`);
    }
    async list() {
        await this.init();
        const files = (await fs.readdir(this.dir)).filter((f) => f.endsWith('.json'));
        const out = [];
        for (const f of files) {
            try {
                const s = SnippetSchema.parse(await fs.readJson(path.join(this.dir, f)));
                out.push({ id: s.id, title: s.title, description: s.description, tags: s.tags, createdAt: s.createdAt });
            }
            catch {
                // skip malformed
            }
        }
        return out.sort((a, b) => b.createdAt - a.createdAt);
    }
    async get(id) {
        const file = this.fileFor(id);
        if (!(await fs.pathExists(file)))
            throw new Error(`Snippet "${id}" not found`);
        return SnippetSchema.parse(await fs.readJson(file));
    }
    async save(input) {
        await this.init();
        const id = input.id ? sanitizeName(input.id) : nanoid(10);
        const snippet = SnippetSchema.parse({
            id,
            title: input.title,
            description: input.description || '',
            tags: input.tags || [],
            elements: input.elements || [],
            createdAt: Date.now(),
        });
        await writeJsonAtomic(this.fileFor(id), snippet);
        return { id: snippet.id, title: snippet.title, description: snippet.description, tags: snippet.tags, createdAt: snippet.createdAt };
    }
    async remove(id) {
        const file = this.fileFor(id);
        if (await fs.pathExists(file))
            await fs.remove(file);
    }
    async rename(id, title) {
        const s = await this.get(id);
        s.title = title;
        await writeJsonAtomic(this.fileFor(id), s);
        return { id: s.id, title: s.title, description: s.description, tags: s.tags, createdAt: s.createdAt };
    }
}

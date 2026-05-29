import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { Snippet, SnippetSchema, SnippetSummary } from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { writeJsonAtomic } from './fs-utils';

/**
 * Per-profile snippet library: small reusable groups of elements that can be
 * quick-inserted onto the canvas. Stored under `<profile>/snippets/<id>.json`.
 */
export class SnippetStore {
  private dir: string;

  constructor(profileDir: string) {
    this.dir = path.join(profileDir, 'snippets');
  }

  async init() {
    await fs.ensureDir(this.dir);
  }

  private fileFor(id: string) {
    return path.join(this.dir, `${sanitizeName(id)}.json`);
  }

  async list(): Promise<SnippetSummary[]> {
    await this.init();
    const files = (await fs.readdir(this.dir)).filter((f) => f.endsWith('.json'));
    const out: SnippetSummary[] = [];
    for (const f of files) {
      try {
        const s = SnippetSchema.parse(await fs.readJson(path.join(this.dir, f)));
        out.push({ id: s.id, title: s.title, description: s.description, tags: s.tags, createdAt: s.createdAt });
      } catch {
        // skip malformed
      }
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  }

  async get(id: string): Promise<Snippet> {
    const file = this.fileFor(id);
    if (!(await fs.pathExists(file))) throw new Error(`Snippet "${id}" not found`);
    return SnippetSchema.parse(await fs.readJson(file));
  }

  async save(input: { id?: string; title: string; description?: string; tags?: string[]; elements: any[] }): Promise<SnippetSummary> {
    await this.init();
    const id = input.id ? sanitizeName(input.id) : nanoid(10);
    const snippet: Snippet = SnippetSchema.parse({
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

  async remove(id: string): Promise<void> {
    const file = this.fileFor(id);
    if (await fs.pathExists(file)) await fs.remove(file);
  }

  async rename(id: string, title: string): Promise<SnippetSummary> {
    const s = await this.get(id);
    s.title = title;
    await writeJsonAtomic(this.fileFor(id), s);
    return { id: s.id, title: s.title, description: s.description, tags: s.tags, createdAt: s.createdAt };
  }
}

import * as path from 'path';
import * as fs from 'fs-extra';
import { SearchResult, FileTags, extractSceneText } from '@excalibur/shared';
import { extractExcalidrawFromPng } from './png-excalidraw';

/**
 * Workspace search index.
 *
 * Walks a workspace directory (skipping hidden/`.excalibur` folders), records
 * file metadata, and — for `.excalidraw`/`.json` files — extracts embedded
 * element text for full-text search. The index is built lazily and cached per
 * workspace; callers can force a rebuild. Designed to stay responsive on large
 * vaults by capping per-file text extraction and skipping binary parsing
 * failures gracefully.
 */

const SEARCHABLE_EXT = new Set(['.excalidraw', '.json', '.png', '.svg']);
const MAX_TEXT_PER_FILE = 4000;
const TAGS_FILE = path.join('.excalibur', 'tags.json');

interface IndexEntry {
  name: string;
  path: string;
  extension: string;
  mtime: number;
  text: string;
}

export class SearchIndex {
  private entries: IndexEntry[] = [];
  private built = false;
  private cacheFile: string;

  constructor(private workspacePath: string) {
    this.cacheFile = path.join(workspacePath, '.excalibur', 'index.json');
  }

  async ensureBuilt(force = false): Promise<void> {
    if (this.built && !force) return;
    this.entries = [];
    await this.walk(this.workspacePath);
    this.built = true;
    await this.persist().catch(() => undefined);
  }

  /** Persist the current index to disk for a fast warm start next launch. */
  async persist(): Promise<void> {
    await fs.ensureDir(path.dirname(this.cacheFile));
    await fs.writeJson(this.cacheFile, { builtAt: Date.now(), entries: this.entries });
  }

  /**
   * Load a previously-persisted index as a warm start (marks the index built so
   * searches answer immediately). Returns false if no usable cache exists.
   * Callers may still `ensureBuilt(true)` afterwards to refresh in the
   * background.
   */
  async loadCache(): Promise<boolean> {
    try {
      const data = await fs.readJson(this.cacheFile);
      if (Array.isArray(data?.entries)) {
        this.entries = data.entries;
        this.built = true;
        return true;
      }
    } catch {
      /* no cache */
    }
    return false;
  }

  private async walk(dir: string): Promise<void> {
    let items: fs.Dirent[];
    try {
      items = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.name.startsWith('.')) continue; // skip hidden + .excalibur
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        await this.walk(full);
        continue;
      }
      const ext = path.extname(item.name).toLowerCase();
      if (!SEARCHABLE_EXT.has(ext)) continue;
      let stat: fs.Stats;
      try {
        stat = await fs.stat(full);
      } catch {
        continue;
      }
      this.entries.push({
        name: item.name,
        path: full,
        extension: ext,
        mtime: stat.mtimeMs,
        text: await this.extractText(full, ext),
      });
    }
  }

  private async extractText(file: string, ext: string): Promise<string> {
    try {
      if (ext === '.excalidraw' || ext === '.json') {
        const scene = await fs.readJson(file);
        return extractSceneText(scene).slice(0, MAX_TEXT_PER_FILE);
      }
      if (ext === '.png') {
        const buf = await fs.readFile(file);
        const scene = extractExcalidrawFromPng(buf);
        return extractSceneText(scene).slice(0, MAX_TEXT_PER_FILE);
      }
    } catch {
      // Non-fatal: file isn't a parseable scene; fall back to name-only search.
    }
    return '';
  }

  async getTags(): Promise<FileTags> {
    const tagsPath = path.join(this.workspacePath, TAGS_FILE);
    if (await fs.pathExists(tagsPath)) {
      try {
        return await fs.readJson(tagsPath);
      } catch {
        return {};
      }
    }
    return {};
  }

  async setTags(filePath: string, tags: string[]): Promise<FileTags> {
    const tagsPath = path.join(this.workspacePath, TAGS_FILE);
    const all = await this.getTags();
    const rel = path.relative(this.workspacePath, filePath);
    if (tags.length === 0) {
      delete all[rel];
    } else {
      all[rel] = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
    }
    await fs.ensureDir(path.dirname(tagsPath));
    await fs.writeJson(tagsPath, all, { spaces: 2 });
    return all;
  }

  async search(query: string): Promise<{ results: SearchResult[]; indexed: number }> {
    await this.ensureBuilt();
    const tags = await this.getTags();
    const q = query.trim().toLowerCase();

    const scored: SearchResult[] = [];
    for (const entry of this.entries) {
      const rel = path.relative(this.workspacePath, entry.path);
      const fileTags = tags[rel] || [];
      const matchedOn: ('name' | 'tag' | 'text')[] = [];

      if (!q) {
        scored.push({
          name: entry.name,
          path: entry.path,
          extension: entry.extension,
          mtime: entry.mtime,
          tags: fileTags,
          matchedOn: [],
        });
        continue;
      }

      if (entry.name.toLowerCase().includes(q)) matchedOn.push('name');
      if (fileTags.some((t) => t.toLowerCase().includes(q))) matchedOn.push('tag');
      let snippet: string | undefined;
      const textLower = entry.text.toLowerCase();
      if (textLower.includes(q)) {
        matchedOn.push('text');
        const idx = textLower.indexOf(q);
        const start = Math.max(0, idx - 20);
        snippet = (start > 0 ? '…' : '') + entry.text.slice(start, idx + q.length + 30);
      }

      if (matchedOn.length > 0) {
        scored.push({
          name: entry.name,
          path: entry.path,
          extension: entry.extension,
          mtime: entry.mtime,
          tags: fileTags,
          snippet,
          matchedOn,
        });
      }
    }

    // Name matches first, then most-recently-modified.
    scored.sort((a, b) => {
      const an = a.matchedOn.includes('name') ? 0 : 1;
      const bn = b.matchedOn.includes('name') ? 0 : 1;
      if (an !== bn) return an - bn;
      return b.mtime - a.mtime;
    });

    return { results: scored, indexed: this.entries.length };
  }

  invalidate() {
    this.built = false;
  }
}

/** Cache of per-workspace indexes keyed by absolute path. */
const indexCache = new Map<string, SearchIndex>();

export function getIndex(workspacePath: string): SearchIndex {
  let idx = indexCache.get(workspacePath);
  if (!idx) {
    idx = new SearchIndex(workspacePath);
    indexCache.set(workspacePath, idx);
  }
  return idx;
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchIndex = void 0;
exports.getIndex = getIndex;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const png_excalidraw_1 = require("./png-excalidraw");
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
class SearchIndex {
    workspacePath;
    entries = [];
    built = false;
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
    }
    async ensureBuilt(force = false) {
        if (this.built && !force)
            return;
        this.entries = [];
        await this.walk(this.workspacePath);
        this.built = true;
    }
    async walk(dir) {
        let items;
        try {
            items = await fs.readdir(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const item of items) {
            if (item.name.startsWith('.'))
                continue; // skip hidden + .excalibur
            const full = path.join(dir, item.name);
            if (item.isDirectory()) {
                await this.walk(full);
                continue;
            }
            const ext = path.extname(item.name).toLowerCase();
            if (!SEARCHABLE_EXT.has(ext))
                continue;
            let stat;
            try {
                stat = await fs.stat(full);
            }
            catch {
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
    async extractText(file, ext) {
        try {
            if (ext === '.excalidraw' || ext === '.json') {
                const scene = await fs.readJson(file);
                return (0, shared_1.extractSceneText)(scene).slice(0, MAX_TEXT_PER_FILE);
            }
            if (ext === '.png') {
                const buf = await fs.readFile(file);
                const scene = (0, png_excalidraw_1.extractExcalidrawFromPng)(buf);
                return (0, shared_1.extractSceneText)(scene).slice(0, MAX_TEXT_PER_FILE);
            }
        }
        catch {
            // Non-fatal: file isn't a parseable scene; fall back to name-only search.
        }
        return '';
    }
    async getTags() {
        const tagsPath = path.join(this.workspacePath, TAGS_FILE);
        if (await fs.pathExists(tagsPath)) {
            try {
                return await fs.readJson(tagsPath);
            }
            catch {
                return {};
            }
        }
        return {};
    }
    async setTags(filePath, tags) {
        const tagsPath = path.join(this.workspacePath, TAGS_FILE);
        const all = await this.getTags();
        const rel = path.relative(this.workspacePath, filePath);
        if (tags.length === 0) {
            delete all[rel];
        }
        else {
            all[rel] = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
        }
        await fs.ensureDir(path.dirname(tagsPath));
        await fs.writeJson(tagsPath, all, { spaces: 2 });
        return all;
    }
    async search(query) {
        await this.ensureBuilt();
        const tags = await this.getTags();
        const q = query.trim().toLowerCase();
        const scored = [];
        for (const entry of this.entries) {
            const rel = path.relative(this.workspacePath, entry.path);
            const fileTags = tags[rel] || [];
            const matchedOn = [];
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
            if (entry.name.toLowerCase().includes(q))
                matchedOn.push('name');
            if (fileTags.some((t) => t.toLowerCase().includes(q)))
                matchedOn.push('tag');
            let snippet;
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
            if (an !== bn)
                return an - bn;
            return b.mtime - a.mtime;
        });
        return { results: scored, indexed: this.entries.length };
    }
    invalidate() {
        this.built = false;
    }
}
exports.SearchIndex = SearchIndex;
/** Cache of per-workspace indexes keyed by absolute path. */
const indexCache = new Map();
function getIndex(workspacePath) {
    let idx = indexCache.get(workspacePath);
    if (!idx) {
        idx = new SearchIndex(workspacePath);
        indexCache.set(workspacePath, idx);
    }
    return idx;
}

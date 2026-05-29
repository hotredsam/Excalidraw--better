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
exports.SnippetStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile snippet library: small reusable groups of elements that can be
 * quick-inserted onto the canvas. Stored under `<profile>/snippets/<id>.json`.
 */
class SnippetStore {
    dir;
    constructor(profileDir) {
        this.dir = path.join(profileDir, 'snippets');
    }
    async init() {
        await fs.ensureDir(this.dir);
    }
    fileFor(id) {
        return path.join(this.dir, `${(0, path_utils_1.sanitizeName)(id)}.json`);
    }
    async list() {
        await this.init();
        const files = (await fs.readdir(this.dir)).filter((f) => f.endsWith('.json'));
        const out = [];
        for (const f of files) {
            try {
                const s = shared_1.SnippetSchema.parse(await fs.readJson(path.join(this.dir, f)));
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
        return shared_1.SnippetSchema.parse(await fs.readJson(file));
    }
    async save(input) {
        await this.init();
        const id = input.id ? (0, path_utils_1.sanitizeName)(input.id) : (0, nanoid_1.nanoid)(10);
        const snippet = shared_1.SnippetSchema.parse({
            id,
            title: input.title,
            description: input.description || '',
            tags: input.tags || [],
            elements: input.elements || [],
            createdAt: Date.now(),
        });
        await (0, fs_utils_1.writeJsonAtomic)(this.fileFor(id), snippet);
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
        await (0, fs_utils_1.writeJsonAtomic)(this.fileFor(id), s);
        return { id: s.id, title: s.title, description: s.description, tags: s.tags, createdAt: s.createdAt };
    }
}
exports.SnippetStore = SnippetStore;

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
exports.LibraryStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile library store for Excalidraw `.excalidrawlib` packs. Libraries are
 * stored as `<profile>/libraries/<id>.excalidrawlib`. Supports import/export,
 * listing, and appending items captured from the canvas.
 */
class LibraryStore {
    dir;
    constructor(profileDir) {
        this.dir = path.join(profileDir, 'libraries');
    }
    async init() {
        await fs.ensureDir(this.dir);
    }
    fileFor(id) {
        return path.join(this.dir, `${(0, path_utils_1.sanitizeName)(id)}.excalidrawlib`);
    }
    async list() {
        await this.init();
        const files = (await fs.readdir(this.dir)).filter((f) => f.endsWith('.excalidrawlib'));
        const out = [];
        for (const f of files) {
            const full = path.join(this.dir, f);
            try {
                const lib = shared_1.LibrarySchema.parse(await fs.readJson(full));
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
        return shared_1.LibrarySchema.parse(await fs.readJson(file));
    }
    async save(id, library) {
        await this.init();
        const parsed = shared_1.LibrarySchema.parse(library);
        await (0, fs_utils_1.writeJsonAtomic)(this.fileFor(id), parsed);
        return { id: (0, path_utils_1.sanitizeName)(id), name: (0, path_utils_1.sanitizeName)(id), itemCount: parsed.libraryItems.length, updatedAt: Date.now() };
    }
    /** Import a `.excalidrawlib` (or raw library JSON) from an absolute path. */
    async importFromFile(srcPath, name) {
        const raw = await fs.readJson(srcPath);
        const lib = shared_1.LibrarySchema.parse(raw);
        const id = (0, path_utils_1.sanitizeName)(name || path.basename(srcPath).replace(/\.excalidrawlib$/, '')) || (0, nanoid_1.nanoid)(6);
        return this.save(id, lib);
    }
    /** Append items to a library, creating it if needed. */
    async addItems(id, items) {
        let lib;
        try {
            lib = await this.get(id);
        }
        catch {
            lib = shared_1.LibrarySchema.parse({ libraryItems: [] });
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
exports.LibraryStore = LibraryStore;

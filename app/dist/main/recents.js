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
exports.RecentsStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile recent-files list. Most-recent first, de-duplicated by path, and
 * capped at `limit`. Stored in `<profile>/recents/recents.json`.
 */
class RecentsStore {
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
        await (0, fs_utils_1.writeJsonAtomic)(this.file, this.recents);
    }
}
exports.RecentsStore = RecentsStore;

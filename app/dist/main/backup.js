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
exports.BackupManager = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const fs_utils_1 = require("./fs-utils");
/**
 * Versioned, per-profile backups. Before overwriting a drawing, a timestamped
 * copy is stashed under `<profile>/backups/`, and an index is maintained so the
 * UI can list and restore previous versions. The number of retained backups per
 * original file is capped.
 */
class BackupManager {
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
        const id = `${Date.now()}-${(0, nanoid_1.nanoid)(6)}`;
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
        await (0, fs_utils_1.writeJsonAtomic)(this.indexFile, this.entries);
    }
}
exports.BackupManager = BackupManager;

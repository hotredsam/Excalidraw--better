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
exports.WorkspaceStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
class WorkspaceStore {
    workspaceFile;
    workspaces = [];
    activeWorkspaceId = null;
    activeFile;
    constructor(profileDir) {
        this.workspaceFile = path.join(profileDir, 'settings', 'workspaces.json');
        this.activeFile = path.join(profileDir, 'settings', 'active_workspace.json');
    }
    async init() {
        if (await fs.pathExists(this.workspaceFile)) {
            const data = await fs.readJson(this.workspaceFile);
            this.workspaces = shared_1.WorkspaceListSchema.parse({ workspaces: data }).workspaces;
        }
        if (await fs.pathExists(this.activeFile)) {
            const data = await fs.readJson(this.activeFile);
            this.activeWorkspaceId = data.activeId;
        }
    }
    async list() {
        return this.workspaces;
    }
    async getActive() {
        return this.workspaces.find(w => w.id === this.activeWorkspaceId) || null;
    }
    async add(name, dirPath) {
        const existing = this.workspaces.find(w => w.path === dirPath);
        if (existing)
            return existing;
        const workspace = {
            id: (0, nanoid_1.nanoid)(),
            name,
            path: dirPath,
            lastOpenedAt: Date.now(),
        };
        this.workspaces.push(workspace);
        await this.saveWorkspaces();
        return workspace;
    }
    async remove(id) {
        this.workspaces = this.workspaces.filter(w => w.id !== id);
        if (this.activeWorkspaceId === id) {
            this.activeWorkspaceId = null;
            await this.saveActive();
        }
        await this.saveWorkspaces();
    }
    async setActive(id) {
        if (id && !this.workspaces.find(w => w.id === id)) {
            throw new Error(`Workspace ${id} not found`);
        }
        this.activeWorkspaceId = id;
        if (id) {
            const ws = this.workspaces.find(w => w.id === id);
            if (ws)
                ws.lastOpenedAt = Date.now();
        }
        await this.saveActive();
        await this.saveWorkspaces();
    }
    async saveWorkspaces() {
        await (0, fs_utils_1.writeJsonAtomic)(this.workspaceFile, this.workspaces);
    }
    async saveActive() {
        await (0, fs_utils_1.writeJsonAtomic)(this.activeFile, { activeId: this.activeWorkspaceId });
    }
}
exports.WorkspaceStore = WorkspaceStore;

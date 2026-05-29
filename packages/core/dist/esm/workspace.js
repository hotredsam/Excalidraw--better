import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { WorkspaceListSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';
export class WorkspaceStore {
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
            this.workspaces = WorkspaceListSchema.parse({ workspaces: data }).workspaces;
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
            id: nanoid(),
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
        await writeJsonAtomic(this.workspaceFile, this.workspaces);
    }
    async saveActive() {
        await writeJsonAtomic(this.activeFile, { activeId: this.activeWorkspaceId });
    }
}

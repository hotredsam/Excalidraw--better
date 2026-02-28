import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { Workspace, WorkspaceSchema, WorkspaceListSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

export class WorkspaceStore {
  private workspaceFile: string;
  private workspaces: Workspace[] = [];
  private activeWorkspaceId: string | null = null;
  private activeFile: string;

  constructor(profileDir: string) {
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

  async list(): Promise<Workspace[]> {
    return this.workspaces;
  }

  async getActive(): Promise<Workspace | null> {
    return this.workspaces.find(w => w.id === this.activeWorkspaceId) || null;
  }

  async add(name: string, dirPath: string): Promise<Workspace> {
    const existing = this.workspaces.find(w => w.path === dirPath);
    if (existing) return existing;

    const workspace: Workspace = {
      id: nanoid(),
      name,
      path: dirPath,
      lastOpenedAt: Date.now(),
    };

    this.workspaces.push(workspace);
    await this.saveWorkspaces();
    return workspace;
  }

  async remove(id: string) {
    this.workspaces = this.workspaces.filter(w => w.id !== id);
    if (this.activeWorkspaceId === id) {
      this.activeWorkspaceId = null;
      await this.saveActive();
    }
    await this.saveWorkspaces();
  }

  async setActive(id: string | null) {
    if (id && !this.workspaces.find(w => w.id === id)) {
      throw new Error(`Workspace ${id} not found`);
    }
    this.activeWorkspaceId = id;
    if (id) {
      const ws = this.workspaces.find(w => w.id === id);
      if (ws) ws.lastOpenedAt = Date.now();
    }
    await this.saveActive();
    await this.saveWorkspaces();
  }

  private async saveWorkspaces() {
    await writeJsonAtomic(this.workspaceFile, this.workspaces);
  }

  private async saveActive() {
    await writeJsonAtomic(this.activeFile, { activeId: this.activeWorkspaceId });
  }
}

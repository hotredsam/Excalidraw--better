import * as path from 'path';
import * as fs from 'fs-extra';
import { randomUUID } from 'crypto';
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
    if (existing) {
      // Update lastOpenedAt when re-adding an existing workspace
      const updated = { ...existing, lastOpenedAt: Date.now() };
      this.workspaces = this.workspaces.map(w => w.id === existing.id ? updated : w);
      await this.saveWorkspaces();
      return updated;
    }

    const workspace: Workspace = {
      id: randomUUID(),
      name,
      path: dirPath,
      lastOpenedAt: Date.now(),
    };

    this.workspaces = [...this.workspaces, workspace];
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
      this.workspaces = this.workspaces.map(w => w.id === id ? { ...w, lastOpenedAt: Date.now() } : w);
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

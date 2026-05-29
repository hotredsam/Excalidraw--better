import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { Profile, ProfileSchema, ProfileListSchema, APPDATA_DIR } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

/**
 * Manages the set of user profiles and their on-disk folders. Framework-
 * agnostic: the base directory is injected (the Electron host passes
 * `app.getPath('userData')`), so the same store works headless. Profiles and
 * their data live under `<userDataDir>/profiles`.
 */
export class ProfileStore {
  private baseDir: string;
  private profilesFile: string;
  private activeFile: string;
  private profiles: Profile[] = [];
  private activeProfileId: string | null = null;

  constructor(userDataDir: string) {
    this.baseDir = path.join(userDataDir, 'profiles');
    this.profilesFile = path.join(this.baseDir, 'profiles.json');
    this.activeFile = path.join(this.baseDir, 'active.json');
  }

  async init() {
    await fs.ensureDir(this.baseDir);

    if (await fs.pathExists(this.profilesFile)) {
      const data = await fs.readJson(this.profilesFile);
      this.profiles = ProfileListSchema.parse({ profiles: data }).profiles;
    }

    if (await fs.pathExists(this.activeFile)) {
      const data = await fs.readJson(this.activeFile);
      this.activeProfileId = data.activeId;
    }

    if (this.profiles.length === 0) {
      const defaultProfile = await this.create('Default');
      await this.setActive(defaultProfile.id);
    } else if (!this.activeProfileId || !this.profiles.find(p => p.id === this.activeProfileId)) {
      await this.setActive(this.profiles[0].id);
    }
  }

  async list(): Promise<Profile[]> {
    return this.profiles;
  }

  async getActive(): Promise<Profile | null> {
    return this.profiles.find(p => p.id === this.activeProfileId) || null;
  }

  async create(name: string): Promise<Profile> {
    const now = Date.now();
    const profile: Profile = {
      id: nanoid(),
      name,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
    };

    this.profiles.push(profile);
    await this.saveProfiles();
    await this.initProfileFolders(profile.id);
    return profile;
  }

  async rename(id: string, name: string): Promise<Profile> {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) throw new Error(`Profile ${id} not found`);

    profile.name = name;
    profile.updatedAt = Date.now();
    await this.saveProfiles();
    return profile;
  }

  async delete(id: string) {
    if (this.profiles.length <= 1) throw new Error('Cannot delete the only profile');

    this.profiles = this.profiles.filter(p => p.id !== id);
    if (this.activeProfileId === id) {
      this.activeProfileId = this.profiles[0].id;
      await this.saveActive();
    }
    await this.saveProfiles();
    // In production, we might want to move the folder to a "deleted" directory instead of immediate delete
    await fs.remove(path.join(this.baseDir, id));
  }

  async setActive(id: string) {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) throw new Error(`Profile ${id} not found`);

    this.activeProfileId = id;
    profile.lastOpenedAt = Date.now();
    await this.saveActive();
    await this.saveProfiles();
  }

  private async saveProfiles() {
    await writeJsonAtomic(this.profilesFile, this.profiles);
  }

  private async saveActive() {
    await writeJsonAtomic(this.activeFile, { activeId: this.activeProfileId });
  }

  private async initProfileFolders(id: string) {
    const profileDir = path.join(this.baseDir, id);
    await fs.ensureDir(path.join(profileDir, 'settings'));
    await fs.ensureDir(path.join(profileDir, 'recents'));
    await fs.ensureDir(path.join(profileDir, 'vault'));
    await fs.ensureDir(path.join(profileDir, 'libraries'));
    await fs.ensureDir(path.join(profileDir, 'templates'));
    await fs.ensureDir(path.join(profileDir, 'plugins'));
    await fs.ensureDir(path.join(profileDir, 'index'));
  }

  getProfileDir(id: string) {
    return path.join(this.baseDir, id);
  }
}

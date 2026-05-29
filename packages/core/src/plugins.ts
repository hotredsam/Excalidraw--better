import * as path from 'path';
import * as fs from 'fs-extra';
import {
  PluginManifestSchema,
  InstalledPlugin,
  PluginContributes,
  PluginManifest,
} from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

interface PluginState {
  enabled: Record<string, boolean>;
  installedAt: Record<string, number>;
}

/**
 * Per-profile plugin manager.
 *
 * Plugins are *declarative* manifests (`plugin.json`) describing contributions
 * the host renders/executes. Built-in plugins ship with the app and live in a
 * read-only directory; user plugins are installed (copied) into the profile's
 * `plugins/` folder. Enablement state is stored per profile so each user has an
 * independent plugin set. Manifests are validated and permissions recorded; the
 * host only ever acts on contributions of *enabled* plugins.
 */
export class PluginManager {
  private pluginsDir: string;
  private stateFile: string;
  private state: PluginState = { enabled: {}, installedAt: {} };

  constructor(profileDir: string, private builtinDir: string | null = null) {
    this.pluginsDir = path.join(profileDir, 'plugins');
    this.stateFile = path.join(profileDir, 'settings', 'plugins.json');
  }

  async init() {
    await fs.ensureDir(this.pluginsDir);
    if (await fs.pathExists(this.stateFile)) {
      try {
        this.state = { enabled: {}, installedAt: {}, ...(await fs.readJson(this.stateFile)) };
      } catch {
        this.state = { enabled: {}, installedAt: {} };
      }
    }
  }

  private async readManifest(dir: string): Promise<PluginManifest | null> {
    const manifestPath = path.join(dir, 'plugin.json');
    if (!(await fs.pathExists(manifestPath))) return null;
    try {
      const raw = await fs.readJson(manifestPath);
      return PluginManifestSchema.parse(raw);
    } catch {
      return null;
    }
  }

  private async scanDir(dir: string, builtIn: boolean): Promise<InstalledPlugin[]> {
    if (!dir || !(await fs.pathExists(dir))) return [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    const out: InstalledPlugin[] = [];
    for (const item of items) {
      if (!item.isDirectory()) continue;
      const manifest = await this.readManifest(path.join(dir, item.name));
      if (!manifest) continue;
      out.push({
        ...manifest,
        builtIn,
        enabled: this.state.enabled[manifest.id] ?? builtIn, // built-ins default on
        installedAt: this.state.installedAt[manifest.id] ?? 0,
      });
    }
    return out;
  }

  async list(): Promise<InstalledPlugin[]> {
    const builtin = await this.scanDir(this.builtinDir || '', true);
    const user = await this.scanDir(this.pluginsDir, false);
    // User plugins override built-ins with the same id.
    const byId = new Map<string, InstalledPlugin>();
    for (const p of builtin) byId.set(p.id, p);
    for (const p of user) byId.set(p.id, p);
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async installFromFolder(srcDir: string): Promise<InstalledPlugin> {
    const manifest = await this.readManifest(srcDir);
    if (!manifest) {
      throw new Error('No valid plugin.json found in the selected folder');
    }
    const dest = path.join(this.pluginsDir, manifest.id);
    await fs.ensureDir(this.pluginsDir);
    await fs.copy(srcDir, dest, { overwrite: true });
    this.state.installedAt[manifest.id] = Date.now();
    this.state.enabled[manifest.id] = true;
    await this.save();
    return {
      ...manifest,
      builtIn: false,
      enabled: true,
      installedAt: this.state.installedAt[manifest.id],
    };
  }

  async setEnabled(id: string, enabled: boolean): Promise<void> {
    this.state.enabled[id] = enabled;
    await this.save();
  }

  async uninstall(id: string): Promise<void> {
    const dir = path.join(this.pluginsDir, id);
    if (await fs.pathExists(dir)) {
      await fs.remove(dir);
    } else {
      throw new Error('Built-in plugins cannot be uninstalled (you can disable them)');
    }
    delete this.state.enabled[id];
    delete this.state.installedAt[id];
    await this.save();
  }

  /** Aggregate contributions from all enabled plugins. */
  async getContributions(): Promise<PluginContributes & { sourcePluginIds: Record<string, string> }> {
    const plugins = await this.list();
    const merged: PluginContributes = { toolbar: [], commands: [], panels: [], exportPresets: [] };
    const sourcePluginIds: Record<string, string> = {};
    for (const p of plugins) {
      if (!p.enabled) continue;
      for (const t of p.contributes.toolbar) {
        merged.toolbar.push(t);
        sourcePluginIds[t.id] = p.id;
      }
      for (const c of p.contributes.commands) {
        merged.commands.push(c);
        sourcePluginIds[c.id] = p.id;
      }
      for (const panel of p.contributes.panels) merged.panels.push(panel);
      for (const preset of p.contributes.exportPresets) {
        merged.exportPresets.push(preset);
        sourcePluginIds[preset.id] = p.id;
      }
    }
    return { ...merged, sourcePluginIds };
  }

  private async save() {
    await writeJsonAtomic(this.stateFile, this.state);
  }
}

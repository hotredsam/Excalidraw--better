import * as path from 'path';
import * as fs from 'fs-extra';
import { PluginInfo, PluginListSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

export class PluginManager {
  private pluginsDir: string;
  private configFile: string;
  private plugins: PluginInfo[] = [];

  constructor(profileDir: string) {
    this.pluginsDir = path.join(profileDir, 'plugins');
    this.configFile = path.join(profileDir, 'settings', 'plugins.json');
  }

  async init() {
    await fs.ensureDir(this.pluginsDir);
    
    // Load enabled/disabled state
    let pluginStates: Record<string, boolean> = {};
    if (await fs.pathExists(this.configFile)) {
      pluginStates = await fs.readJson(this.configFile);
    }

    // Scan directories
    const items = await fs.readdir(this.pluginsDir, { withFileTypes: true });
    const discovered: PluginInfo[] = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const manifestPath = path.join(this.pluginsDir, item.name, 'manifest.json');
        if (await fs.pathExists(manifestPath)) {
          try {
            const manifest = await fs.readJson(manifestPath);
            discovered.push({
              id: manifest.id || item.name,
              name: manifest.name || item.name,
              version: manifest.version || '0.0.0',
              description: manifest.description,
              author: manifest.author,
              enabled: pluginStates[manifest.id] ?? false,
              path: path.join(this.pluginsDir, item.name),
            });
          } catch (err) {
            console.error(`Failed to load manifest for plugin ${item.name}:`, err);
          }
        }
      }
    }

    this.plugins = discovered;
  }

  async list(): Promise<PluginInfo[]> {
    return this.plugins;
  }

  async setEnabled(id: string, enabled: boolean) {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin) throw new Error(`Plugin ${id} not found`);
    
    plugin.enabled = enabled;
    await this.saveStates();
    
    if (enabled) {
      // TODO: Implement loading logic
    } else {
      // TODO: Implement unloading logic
    }
  }

  private async saveStates() {
    const states = this.plugins.reduce((acc, p) => {
      acc[p.id] = p.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    await writeJsonAtomic(this.configFile, states);
  }
}

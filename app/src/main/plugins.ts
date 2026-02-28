import { app } from 'electron';
import { PluginInfo, PluginListSchema } from '@excalibur/shared';
import { ExcaliburPlugin, PluginContext } from '@excalibur/plugin-sdk';

export class PluginManager {
  private pluginsDir: string;
  private configFile: string;
  private plugins: PluginInfo[] = [];
  private loadedPlugins: Map<string, ExcaliburPlugin> = new Map();

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
            const info: PluginInfo = {
              id: manifest.id || item.name,
              name: manifest.name || item.name,
              version: manifest.version || '0.0.0',
              description: manifest.description,
              author: manifest.author,
              enabled: pluginStates[manifest.id] ?? false,
              path: path.join(this.pluginsDir, item.name),
            };
            discovered.push(info);

            if (info.enabled) {
              await this.loadPlugin(info, manifest.entry);
            }
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
    
    if (plugin.enabled === enabled) return;

    plugin.enabled = enabled;
    await this.saveStates();
    
    if (enabled) {
      const manifestPath = path.join(plugin.path, 'manifest.json');
      const manifest = await fs.readJson(manifestPath);
      await this.loadPlugin(plugin, manifest.entry);
    } else {
      await this.unloadPlugin(id);
    }
  }

  private async loadPlugin(info: PluginInfo, entry: string) {
    const entryPath = path.isAbsolute(entry) ? entry : path.join(info.path, entry);
    
    try {
      // Use dynamic import for ESM or require for CJS
      // For foundation, we'll try to load the module
      const pluginModule = require(entryPath);
      const pluginInstance: ExcaliburPlugin = pluginModule.default || pluginModule;
      
      const ctx: PluginContext = {
        version: app.getVersion(),
        platform: process.platform,
      };

      if (typeof pluginInstance.onLoad === 'function') {
        await pluginInstance.onLoad(ctx);
      }

      this.loadedPlugins.set(info.id, pluginInstance);
      console.log(`Plugin loaded: ${info.name} (${info.id})`);
    } catch (err) {
      console.error(`Failed to load plugin entry ${entryPath}:`, err);
      info.enabled = false;
      await this.saveStates();
    }
  }

  private async unloadPlugin(id: string) {
    const instance = this.loadedPlugins.get(id);
    if (instance && typeof instance.onUnload === 'function') {
      try {
        await instance.onUnload();
      } catch (err) {
        console.error(`Error during plugin unload (${id}):`, err);
      }
    }
    this.loadedPlugins.delete(id);
    console.log(`Plugin unloaded: ${id}`);
  }

  private async saveStates() {
    const states = this.plugins.reduce((acc, p) => {
      acc[p.id] = p.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    await writeJsonAtomic(this.configFile, states);
  }
}

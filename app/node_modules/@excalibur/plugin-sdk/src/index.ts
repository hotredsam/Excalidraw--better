export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  permissions?: string[];
  entry: string; // File path to main entry
}

export interface PluginContext {
  version: string;
  platform: string;
  // TODO: Add more safe APIs for plugins to use
}

export interface ExcaliburPlugin {
  onLoad: (ctx: PluginContext) => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
}

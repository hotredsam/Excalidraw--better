export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description?: string;
    author?: string;
    permissions?: string[];
    entry: string;
}
export interface PluginContext {
    version: string;
    platform: string;
}
export interface ExcaliburPlugin {
    onLoad: (ctx: PluginContext) => void | Promise<void>;
    onUnload?: () => void | Promise<void>;
}

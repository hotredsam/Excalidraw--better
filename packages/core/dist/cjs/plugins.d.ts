import { InstalledPlugin, PluginContributes } from '@excalibur/shared';
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
export declare class PluginManager {
    private builtinDir;
    private pluginsDir;
    private stateFile;
    private state;
    constructor(profileDir: string, builtinDir?: string | null);
    init(): Promise<void>;
    private readManifest;
    private scanDir;
    list(): Promise<InstalledPlugin[]>;
    installFromFolder(srcDir: string): Promise<InstalledPlugin>;
    setEnabled(id: string, enabled: boolean): Promise<void>;
    uninstall(id: string): Promise<void>;
    /** Aggregate contributions from all enabled plugins. */
    getContributions(): Promise<PluginContributes & {
        sourcePluginIds: Record<string, string>;
    }>;
    private save;
}

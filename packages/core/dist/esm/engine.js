import { ProfileStore } from './profile';
import { SettingsStore } from './settings';
import { WorkspaceStore } from './workspace';
import { PluginManager } from './plugins';
import { TemplateStore } from './templates';
import { RecentsStore } from './recents';
import { LibraryStore } from './libraries';
import { BackupManager } from './backup';
import { SnippetStore } from './snippets';
import { ShortcutStore } from './shortcuts';
import { StylePresetStore } from './style-presets';
import { SearchIndex } from './search';
import { isPathWithin, isDangerousPath } from './path-utils';
/**
 * The headless application engine. Owns the profile store and the set of
 * profile-scoped stores, rebinding them when the active profile changes. All
 * platform-specific capabilities come from the injected {@link HostServices};
 * the engine itself has no Electron (or any host framework) dependency, so it
 * runs unchanged in Electron, Node, a server, or a test harness.
 *
 * `createApiHandlers(engine, host)` wraps an engine into the transport-agnostic
 * API surface consumed by the renderer.
 */
export class ExcaliburEngine {
    host;
    profileStore;
    settingsStore;
    workspaceStore;
    pluginManager;
    templateStore;
    recentsStore;
    libraryStore;
    backupManager;
    snippetStore;
    shortcutStore;
    stylePresetStore;
    /** Per-workspace search index cache (engine-scoped, was a module singleton). */
    indexCache = new Map();
    constructor(host) {
        this.host = host;
    }
    /** Initialise the profile store and bind the active profile (if any). */
    async init() {
        this.profileStore = new ProfileStore(this.host.userDataDir);
        await this.profileStore.init();
        const activeProfile = await this.profileStore.getActive();
        if (activeProfile) {
            await this.bindProfile(activeProfile.id);
        }
    }
    /** (Re)instantiate all profile-scoped stores for the given profile. */
    async bindProfile(profileId) {
        const profileDir = this.profileStore.getProfileDir(profileId);
        this.settingsStore = new SettingsStore(profileDir);
        await this.settingsStore.init();
        this.workspaceStore = new WorkspaceStore(profileDir);
        await this.workspaceStore.init();
        this.pluginManager = new PluginManager(profileDir, this.host.builtinPluginsDir);
        await this.pluginManager.init();
        this.templateStore = new TemplateStore(profileDir);
        await this.templateStore.init();
        const settings = this.settingsStore.get();
        this.recentsStore = new RecentsStore(profileDir, settings.recentsLimit);
        await this.recentsStore.init();
        this.recentsStore.setLimit(settings.recentsLimit);
        this.libraryStore = new LibraryStore(profileDir);
        await this.libraryStore.init();
        this.backupManager = new BackupManager(profileDir, settings.backupsToKeep);
        await this.backupManager.init();
        this.snippetStore = new SnippetStore(profileDir);
        await this.snippetStore.init();
        this.shortcutStore = new ShortcutStore(profileDir);
        await this.shortcutStore.init();
        this.stylePresetStore = new StylePresetStore(profileDir);
        await this.stylePresetStore.init();
    }
    /** Resolve (and cache) the search index for a workspace path. */
    getIndex(workspacePath) {
        let idx = this.indexCache.get(workspacePath);
        if (!idx) {
            idx = new SearchIndex(workspacePath);
            this.indexCache.set(workspacePath, idx);
        }
        return idx;
    }
    async getWorkspaceOrThrow(workspaceId) {
        const workspaces = await this.workspaceStore.list();
        const workspace = workspaces.find((w) => w.id === workspaceId);
        if (!workspace)
            throw new Error('Workspace not found');
        return workspace;
    }
    assertWritable(workspace, filePath) {
        if (!isPathWithin(workspace.path, filePath)) {
            throw new Error('Access denied: Path outside workspace');
        }
        if (isDangerousPath(filePath)) {
            throw new Error('Access denied: Dangerous path');
        }
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcaliburEngine = void 0;
const profile_1 = require("./profile");
const settings_1 = require("./settings");
const workspace_1 = require("./workspace");
const plugins_1 = require("./plugins");
const templates_1 = require("./templates");
const recents_1 = require("./recents");
const libraries_1 = require("./libraries");
const backup_1 = require("./backup");
const snippets_1 = require("./snippets");
const shortcuts_1 = require("./shortcuts");
const style_presets_1 = require("./style-presets");
const search_1 = require("./search");
const path_utils_1 = require("./path-utils");
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
class ExcaliburEngine {
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
        this.profileStore = new profile_1.ProfileStore(this.host.userDataDir);
        await this.profileStore.init();
        const activeProfile = await this.profileStore.getActive();
        if (activeProfile) {
            await this.bindProfile(activeProfile.id);
        }
    }
    /** (Re)instantiate all profile-scoped stores for the given profile. */
    async bindProfile(profileId) {
        const profileDir = this.profileStore.getProfileDir(profileId);
        this.settingsStore = new settings_1.SettingsStore(profileDir);
        await this.settingsStore.init();
        this.workspaceStore = new workspace_1.WorkspaceStore(profileDir);
        await this.workspaceStore.init();
        this.pluginManager = new plugins_1.PluginManager(profileDir, this.host.builtinPluginsDir);
        await this.pluginManager.init();
        this.templateStore = new templates_1.TemplateStore(profileDir);
        await this.templateStore.init();
        const settings = this.settingsStore.get();
        this.recentsStore = new recents_1.RecentsStore(profileDir, settings.recentsLimit);
        await this.recentsStore.init();
        this.recentsStore.setLimit(settings.recentsLimit);
        this.libraryStore = new libraries_1.LibraryStore(profileDir);
        await this.libraryStore.init();
        this.backupManager = new backup_1.BackupManager(profileDir, settings.backupsToKeep);
        await this.backupManager.init();
        this.snippetStore = new snippets_1.SnippetStore(profileDir);
        await this.snippetStore.init();
        this.shortcutStore = new shortcuts_1.ShortcutStore(profileDir);
        await this.shortcutStore.init();
        this.stylePresetStore = new style_presets_1.StylePresetStore(profileDir);
        await this.stylePresetStore.init();
    }
    /** Resolve (and cache) the search index for a workspace path. */
    getIndex(workspacePath) {
        let idx = this.indexCache.get(workspacePath);
        if (!idx) {
            idx = new search_1.SearchIndex(workspacePath);
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
        if (!(0, path_utils_1.isPathWithin)(workspace.path, filePath)) {
            throw new Error('Access denied: Path outside workspace');
        }
        if ((0, path_utils_1.isDangerousPath)(filePath)) {
            throw new Error('Access denied: Dangerous path');
        }
    }
}
exports.ExcaliburEngine = ExcaliburEngine;

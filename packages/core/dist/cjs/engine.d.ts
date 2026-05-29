import { Workspace } from '@excalibur/shared';
import { HostServices } from './host';
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
export declare class ExcaliburEngine {
    readonly host: HostServices;
    profileStore: ProfileStore;
    settingsStore: SettingsStore;
    workspaceStore: WorkspaceStore;
    pluginManager: PluginManager;
    templateStore: TemplateStore;
    recentsStore: RecentsStore;
    libraryStore: LibraryStore;
    backupManager: BackupManager;
    snippetStore: SnippetStore;
    shortcutStore: ShortcutStore;
    stylePresetStore: StylePresetStore;
    /** Per-workspace search index cache (engine-scoped, was a module singleton). */
    private indexCache;
    constructor(host: HostServices);
    /** Initialise the profile store and bind the active profile (if any). */
    init(): Promise<void>;
    /** (Re)instantiate all profile-scoped stores for the given profile. */
    bindProfile(profileId: string): Promise<void>;
    /** Resolve (and cache) the search index for a workspace path. */
    getIndex(workspacePath: string): SearchIndex;
    getWorkspaceOrThrow(workspaceId: string): Promise<Workspace>;
    assertWritable(workspace: Workspace, filePath: string): void;
}

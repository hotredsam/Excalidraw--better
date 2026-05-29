import type {
  AppPing,
  Profile,
  ProfileList,
  Settings,
  Workspace,
  WorkspaceList,
  FileInfo,
  ExcalidrawFile,
  InstalledPlugin,
  PluginList,
  PluginContributes,
  AiValidationResult,
  AiApplyResult,
  AiPayload,
  SearchResultList,
  FileTags,
  TemplateList,
  TemplateSummary,
  StoredTemplate,
  RecentFileList,
  RecentFile,
  LibraryList,
  Library,
  LibrarySummary,
  BulkResult,
  BulkRenameOptions,
  SlideDeck,
  Review,
  WorkspaceStats,
  GitStatus,
  Command,
  BackupList,
  MarkdownOptions,
  SnippetList,
  Snippet,
  SnippetSummary,
  ShortcutBinding,
  WorkspaceConfig,
  StylePreset,
} from '@excalibur/shared';

type Ok = { success: boolean };
type PathResult = { path: string };

declare global {
  interface Window {
    api: {
      app: {
        ping: () => Promise<AppPing>;
      };
      profiles: {
        list: () => Promise<ProfileList>;
        getActive: () => Promise<Profile | null>;
        setActive: (id: string) => Promise<Ok>;
        create: (name: string) => Promise<Profile>;
        rename: (id: string, name: string) => Promise<Profile>;
        delete: (id: string) => Promise<Ok>;
      };
      settings: {
        get: () => Promise<Settings>;
        update: (partial: Partial<Settings>) => Promise<Settings>;
      };
      workspaces: {
        list: () => Promise<WorkspaceList>;
        add: () => Promise<Workspace | null>;
        remove: (id: string) => Promise<Ok>;
        setActive: (id: string | null) => Promise<Ok>;
        getActive: () => Promise<Workspace | null>;
        listFiles: (workspaceId: string, subDir?: string) => Promise<FileInfo[]>;
        readFile: (workspaceId: string, filePath: string) => Promise<string>;
        readExcalidrawFile: (workspaceId: string, filePath: string) => Promise<ExcalidrawFile>;
        writeFile: (workspaceId: string, filePath: string, content: string) => Promise<Ok>;
        writeBinaryFile: (workspaceId: string, filePath: string, base64: string) => Promise<Ok>;
        deleteFile: (workspaceId: string, filePath: string) => Promise<Ok>;
        renameFile: (workspaceId: string, filePath: string, newName: string) => Promise<PathResult>;
        moveFile: (workspaceId: string, filePath: string, destDir: string) => Promise<PathResult>;
        copyFile: (workspaceId: string, filePath: string, destDir?: string) => Promise<PathResult>;
        createFile: (workspaceId: string, dir: string | null, name: string) => Promise<PathResult>;
        createFolder: (workspaceId: string, dir: string | null, name: string) => Promise<PathResult>;
        search: (workspaceId: string, query: string) => Promise<SearchResultList>;
        getTags: (workspaceId: string) => Promise<FileTags>;
        setTags: (workspaceId: string, filePath: string, tags: string[]) => Promise<FileTags>;
        exportFile: (
          workspaceId: string,
          filePath: string,
          format: 'png' | 'svg' | 'json',
          data: string,
          scene: any,
        ) => Promise<{ success: boolean; path: string }>;
      };
      plugins: {
        list: () => Promise<PluginList>;
        getContributions: () => Promise<PluginContributes & { sourcePluginIds: Record<string, string> }>;
        installFromFolder: () => Promise<InstalledPlugin | null>;
        enable: (id: string) => Promise<Ok>;
        disable: (id: string) => Promise<Ok>;
        uninstall: (id: string) => Promise<Ok>;
      };
      ai: {
        validate: (raw: string) => Promise<AiValidationResult>;
        apply: (payload: AiPayload) => Promise<AiApplyResult>;
      };
      templates: {
        list: () => Promise<TemplateList>;
        apply: (id: string) => Promise<StoredTemplate>;
        save: (input: { id?: string; title: string; description?: string; tags?: string[]; scene: any }) => Promise<TemplateSummary>;
      };
      recents: {
        list: () => Promise<RecentFileList>;
        add: (entry: RecentFile) => Promise<RecentFileList>;
        remove: (filePath: string) => Promise<RecentFileList>;
        clear: () => Promise<Ok>;
      };
      libraries: {
        list: () => Promise<LibraryList>;
        get: (id: string) => Promise<Library>;
        import: () => Promise<LibrarySummary | null>;
        addItems: (id: string, items: any[]) => Promise<LibrarySummary>;
        remove: (id: string) => Promise<Ok>;
        export: (id: string) => Promise<{ json: string }>;
      };
      bulk: {
        rename: (workspaceId: string, files: string[], options: BulkRenameOptions) => Promise<BulkResult>;
        delete: (workspaceId: string, files: string[]) => Promise<BulkResult>;
        move: (workspaceId: string, files: string[], destDir: string) => Promise<BulkResult>;
      };
      presentation: {
        getDeck: (workspaceId: string, filePath: string, scene: any) => Promise<SlideDeck>;
        setNotes: (workspaceId: string, filePath: string, slideId: string, notes: string) => Promise<Ok>;
      };
      review: {
        get: (workspaceId: string, filePath: string) => Promise<Review>;
        addPin: (workspaceId: string, filePath: string, x: number, y: number, author: string, body: string) => Promise<Review>;
        addComment: (workspaceId: string, filePath: string, pinId: string, author: string, body: string) => Promise<Review>;
        setResolved: (workspaceId: string, filePath: string, pinId: string, resolved: boolean) => Promise<Review>;
        deletePin: (workspaceId: string, filePath: string, pinId: string) => Promise<Review>;
      };
      stats: {
        compute: (workspaceId: string) => Promise<WorkspaceStats>;
      };
      git: {
        status: (workspaceId: string) => Promise<GitStatus>;
        commit: (workspaceId: string, message: string, files?: string[]) => Promise<{ output: string }>;
        log: (workspaceId: string, limit?: number) => Promise<{ entries: { hash: string; subject: string; date: string }[] }>;
        init: (workspaceId: string) => Promise<Ok>;
      };
      commands: {
        list: () => Promise<{ commands: Command[] }>;
      };
      backups: {
        list: (originalPath?: string) => Promise<BackupList>;
        restore: (id: string, destPath?: string) => Promise<{ path: string }>;
      };
      markdown: {
        export: (workspaceId: string, baseName: string, options: MarkdownOptions, imageData: string, scene: any, bodyText?: string) => Promise<{ imagePath: string; markdownPath: string }>;
      };
      import: {
        pickImage: () => Promise<{ file: { id: string; dataURL: string; mimeType: string; created: number }; element: any; mimeType: string } | null>;
        pickSvgAsElements: () => Promise<{ elements: any[]; skipped: number } | null>;
      };
      snippets: {
        list: () => Promise<SnippetList>;
        get: (id: string) => Promise<Snippet>;
        save: (input: { id?: string; title: string; description?: string; tags?: string[]; elements: any[] }) => Promise<SnippetSummary>;
        remove: (id: string) => Promise<Ok>;
        rename: (id: string, title: string) => Promise<SnippetSummary>;
      };
      shortcuts: {
        list: () => Promise<{ bindings: ShortcutBinding[] }>;
        set: (commandId: string, accelerator: string, force?: boolean) => Promise<{ bindings: ShortcutBinding[] }>;
        reset: (commandId?: string) => Promise<{ bindings: ShortcutBinding[] }>;
      };
      workspaceConfig: {
        get: (workspaceId: string) => Promise<WorkspaceConfig>;
        update: (workspaceId: string, partial: Partial<WorkspaceConfig>) => Promise<WorkspaceConfig>;
      };
      styles: {
        list: () => Promise<{ presets: StylePreset[] }>;
        save: (input: Omit<StylePreset, 'id'> & { id?: string }) => Promise<StylePreset>;
        remove: (id: string) => Promise<{ success: boolean }>;
      };
      onMenuCommand: (cb: (cmd: string) => void) => () => void;
    };
  }
}

export {};

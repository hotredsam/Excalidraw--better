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
      onMenuCommand: (cb: (cmd: string) => void) => () => void;
    };
  }
}

export {};

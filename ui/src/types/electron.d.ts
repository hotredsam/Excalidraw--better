import {
  AppPingSchema,
  ProfileSchema,
  ProfileListSchema,
  SettingsSchema,
  WorkspaceSchema,
  WorkspaceListSchema,
  FileInfoSchema,
  ExcalidrawFileSchema,
  Profile,
  ProfileList,
  Settings,
  Workspace,
  WorkspaceList,
  FileInfo,
  ExcalidrawFile,
  PluginInfo,
} from '@excalibur/shared';

declare global {
  interface Window {
    api: {
      app: {
        ping: () => Promise<ReturnType<typeof AppPingSchema.parse>>;
      };
      profiles: {
        list: () => Promise<ProfileList>;
        getActive: () => Promise<Profile | null>;
        setActive: (id: string) => Promise<{ success: boolean }>;
        create: (name: string) => Promise<Profile>;
        rename: (id: string, name: string) => Promise<Profile>;
        delete: (id: string) => Promise<{ success: boolean }>;
      };
      settings: {
        get: () => Promise<Settings>;
        update: (partial: Partial<Settings>) => Promise<Settings>;
      };
      workspaces: {
        list: () => Promise<WorkspaceList>;
        add: () => Promise<Workspace | null>;
        remove: (id: string) => Promise<{ success: boolean }>;
        setActive: (id: string | null) => Promise<{ success: boolean }>;
        getActive: () => Promise<Workspace | null>;
        listFiles: (workspaceId: string, subDir?: string) => Promise<FileInfo[]>;
        readFile: (workspaceId: string, filePath: string) => Promise<string>;
        readExcalidrawFile: (workspaceId: string, filePath: string) => Promise<ExcalidrawFile>;
        writeFile: (workspaceId: string, filePath: string, content: string) => Promise<{ success: boolean }>;
        deleteFile: (workspaceId: string, filePath: string) => Promise<{ success: boolean }>;
      };
      plugins: {
        list: () => Promise<{ plugins: PluginInfo[] }>;
        setEnabled: (id: string, enabled: boolean) => Promise<{ success: boolean }>;
      };
      aiImport: {
        validate: (content: string) => Promise<{ valid: boolean; type?: string; payload?: unknown; errors?: string[] }>;
        apply: (payload: unknown) => Promise<{ success: boolean; message: string }>;
      };
    };
  }
}

import { AppPing, Profile, ProfileList, Settings } from '@excalibur/shared';

declare global {
  interface Window {
    api: {
      app: {
        ping: () => Promise<AppPing>;
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
    };
  }
}

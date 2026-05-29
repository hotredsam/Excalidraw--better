import { Profile } from '@excalibur/shared';
/**
 * Manages the set of user profiles and their on-disk folders. Framework-
 * agnostic: the base directory is injected (the Electron host passes
 * `app.getPath('userData')`), so the same store works headless. Profiles and
 * their data live under `<userDataDir>/profiles`.
 */
export declare class ProfileStore {
    private baseDir;
    private profilesFile;
    private activeFile;
    private profiles;
    private activeProfileId;
    constructor(userDataDir: string);
    init(): Promise<void>;
    list(): Promise<Profile[]>;
    getActive(): Promise<Profile | null>;
    create(name: string): Promise<Profile>;
    rename(id: string, name: string): Promise<Profile>;
    delete(id: string): Promise<void>;
    setActive(id: string): Promise<void>;
    private saveProfiles;
    private saveActive;
    private initProfileFolders;
    getProfileDir(id: string): string;
}

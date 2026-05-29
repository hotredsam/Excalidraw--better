import { Workspace } from '@excalibur/shared';
export declare class WorkspaceStore {
    private workspaceFile;
    private workspaces;
    private activeWorkspaceId;
    private activeFile;
    constructor(profileDir: string);
    init(): Promise<void>;
    list(): Promise<Workspace[]>;
    getActive(): Promise<Workspace | null>;
    add(name: string, dirPath: string): Promise<Workspace>;
    remove(id: string): Promise<void>;
    setActive(id: string | null): Promise<void>;
    private saveWorkspaces;
    private saveActive;
}

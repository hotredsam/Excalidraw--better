/** Rename a file/folder in place (same directory, new name). */
export declare function renameEntry(workspacePath: string, filePath: string, newName: string): Promise<{
    path: string;
}>;
/** Move a file/folder into another directory within the workspace. */
export declare function moveEntry(workspacePath: string, filePath: string, destDir: string): Promise<{
    path: string;
}>;
/** Copy a file/folder, auto-suffixing the name if a collision occurs. */
export declare function copyEntry(workspacePath: string, filePath: string, destDir?: string): Promise<{
    path: string;
}>;
/** Create a new blank `.excalidraw` file. */
export declare function createExcalidrawFile(workspacePath: string, dir: string, name: string): Promise<{
    path: string;
}>;
/** Create a new folder. */
export declare function createFolder(workspacePath: string, dir: string, name: string): Promise<{
    path: string;
}>;

import { WorkspaceConfig } from '@excalibur/shared';
/**
 * Per-workspace configuration stored at `<workspace>/.excalibur/config.json`:
 * default tags applied to new files, glob patterns to exclude from listing and
 * search, and an auto-index toggle.
 */
export declare class WorkspaceConfigStore {
    private workspacePath;
    private file;
    constructor(workspacePath: string);
    get(): Promise<WorkspaceConfig>;
    update(partial: Partial<WorkspaceConfig>): Promise<WorkspaceConfig>;
}
/**
 * Convert a simple glob (`*`, `**`, `?`) to a RegExp. `**` matches across path
 * separators; `*` matches within a segment; `?` matches a single char.
 */
export declare function globToRegExp(glob: string): RegExp;
/** Test a workspace-relative path (forward-slash) against a list of globs. */
export declare function matchesAnyGlob(relPath: string, globs: string[]): boolean;

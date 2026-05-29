import { GitStatus } from '@excalibur/shared';
/**
 * Optional, permission-gated git integration. Uses `execFile` (no shell) so
 * arguments cannot be interpreted as shell metacharacters. Every operation is
 * scoped to a workspace directory. If the directory is not a git repo, status
 * reports `isRepo: false` rather than throwing.
 *
 * `runner` is injectable for tests.
 */
export type GitRunner = (args: string[], cwd: string) => Promise<{
    stdout: string;
    stderr: string;
}>;
export declare class GitHelper {
    private cwd;
    private runner;
    constructor(cwd: string, runner?: GitRunner);
    status(): Promise<GitStatus>;
    add(paths: string[]): Promise<void>;
    commit(message: string, paths?: string[]): Promise<string>;
    log(limit?: number): Promise<{
        hash: string;
        subject: string;
        date: string;
    }[]>;
    init(): Promise<void>;
}

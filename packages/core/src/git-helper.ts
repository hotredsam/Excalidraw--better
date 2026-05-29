import { execFile } from 'child_process';
import { GitStatus, parseGitStatus } from '@excalibur/shared';

/**
 * Optional, permission-gated git integration. Uses `execFile` (no shell) so
 * arguments cannot be interpreted as shell metacharacters. Every operation is
 * scoped to a workspace directory. If the directory is not a git repo, status
 * reports `isRepo: false` rather than throwing.
 *
 * `runner` is injectable for tests.
 */
export type GitRunner = (args: string[], cwd: string) => Promise<{ stdout: string; stderr: string }>;

const defaultRunner: GitRunner = (args, cwd) =>
  new Promise((resolve, reject) => {
    execFile('git', args, { cwd, timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stdout, stderr }));
      else resolve({ stdout, stderr });
    });
  });

const LOG_SEP = '|:excalibur:|';

export class GitHelper {
  constructor(private cwd: string, private runner: GitRunner = defaultRunner) {}

  async status(): Promise<GitStatus> {
    try {
      const { stdout } = await this.runner(['status', '--porcelain=v1', '-b'], this.cwd);
      return parseGitStatus(stdout);
    } catch {
      return { isRepo: false, ahead: 0, behind: 0, files: [], clean: true };
    }
  }

  async add(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    await this.runner(['add', '--', ...paths], this.cwd);
  }

  async commit(message: string, paths?: string[]): Promise<string> {
    if (!message.trim()) throw new Error('Commit message required');
    if (paths && paths.length) await this.add(paths);
    else await this.runner(['add', '-A'], this.cwd);
    const { stdout } = await this.runner(['commit', '-m', message], this.cwd);
    return stdout.trim();
  }

  async log(limit = 20): Promise<{ hash: string; subject: string; date: string }[]> {
    try {
      const { stdout } = await this.runner(
        ['log', `-${limit}`, `--pretty=format:%h${LOG_SEP}%s${LOG_SEP}%ci`],
        this.cwd,
      );
      return stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, subject, date] = line.split(LOG_SEP);
          return { hash: hash || '', subject: subject || '', date: date || '' };
        });
    } catch {
      return [];
    }
  }

  async init(): Promise<void> {
    await this.runner(['init'], this.cwd);
  }
}

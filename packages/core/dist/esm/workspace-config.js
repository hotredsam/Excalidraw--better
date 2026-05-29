import * as path from 'path';
import * as fs from 'fs-extra';
import { WorkspaceConfigSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';
/**
 * Per-workspace configuration stored at `<workspace>/.excalibur/config.json`:
 * default tags applied to new files, glob patterns to exclude from listing and
 * search, and an auto-index toggle.
 */
export class WorkspaceConfigStore {
    workspacePath;
    file;
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
        this.file = path.join(workspacePath, '.excalibur', 'config.json');
    }
    async get() {
        if (await fs.pathExists(this.file)) {
            try {
                return WorkspaceConfigSchema.parse(await fs.readJson(this.file));
            }
            catch {
                return WorkspaceConfigSchema.parse({});
            }
        }
        return WorkspaceConfigSchema.parse({});
    }
    async update(partial) {
        const next = WorkspaceConfigSchema.parse({ ...(await this.get()), ...partial });
        await fs.ensureDir(path.dirname(this.file));
        await writeJsonAtomic(this.file, next);
        return next;
    }
}
/**
 * Convert a simple glob (`*`, `**`, `?`) to a RegExp. `**` matches across path
 * separators; `*` matches within a segment; `?` matches a single char.
 */
export function globToRegExp(glob) {
    let re = '';
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];
        if (c === '*') {
            if (glob[i + 1] === '*') {
                re += '.*';
                i++;
                if (glob[i + 1] === '/')
                    i++; // consume trailing slash of **/
            }
            else {
                re += '[^/]*';
            }
        }
        else if (c === '?') {
            re += '[^/]';
        }
        else if ('.+^${}()|[]\\'.includes(c)) {
            re += '\\' + c;
        }
        else {
            re += c;
        }
    }
    return new RegExp(`^${re}$`, 'i');
}
/** Test a workspace-relative path (forward-slash) against a list of globs. */
export function matchesAnyGlob(relPath, globs) {
    const normalized = relPath.replace(/\\/g, '/');
    return globs.some((g) => globToRegExp(g).test(normalized) || globToRegExp(g).test(path.basename(normalized)));
}

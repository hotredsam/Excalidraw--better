"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHelper = void 0;
const child_process_1 = require("child_process");
const shared_1 = require("@excalibur/shared");
const defaultRunner = (args, cwd) => new Promise((resolve, reject) => {
    (0, child_process_1.execFile)('git', args, { cwd, timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err)
            reject(Object.assign(err, { stdout, stderr }));
        else
            resolve({ stdout, stderr });
    });
});
const LOG_SEP = '|:excalibur:|';
class GitHelper {
    cwd;
    runner;
    constructor(cwd, runner = defaultRunner) {
        this.cwd = cwd;
        this.runner = runner;
    }
    async status() {
        try {
            const { stdout } = await this.runner(['status', '--porcelain=v1', '-b'], this.cwd);
            return (0, shared_1.parseGitStatus)(stdout);
        }
        catch {
            return { isRepo: false, ahead: 0, behind: 0, files: [], clean: true };
        }
    }
    async add(paths) {
        if (paths.length === 0)
            return;
        await this.runner(['add', '--', ...paths], this.cwd);
    }
    async commit(message, paths) {
        if (!message.trim())
            throw new Error('Commit message required');
        if (paths && paths.length)
            await this.add(paths);
        else
            await this.runner(['add', '-A'], this.cwd);
        const { stdout } = await this.runner(['commit', '-m', message], this.cwd);
        return stdout.trim();
    }
    async log(limit = 20) {
        try {
            const { stdout } = await this.runner(['log', `-${limit}`, `--pretty=format:%h${LOG_SEP}%s${LOG_SEP}%ci`], this.cwd);
            return stdout
                .split('\n')
                .filter(Boolean)
                .map((line) => {
                const [hash, subject, date] = line.split(LOG_SEP);
                return { hash: hash || '', subject: subject || '', date: date || '' };
            });
        }
        catch {
            return [];
        }
    }
    async init() {
        await this.runner(['init'], this.cwd);
    }
}
exports.GitHelper = GitHelper;

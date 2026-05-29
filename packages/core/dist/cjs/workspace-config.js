"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceConfigStore = void 0;
exports.globToRegExp = globToRegExp;
exports.matchesAnyGlob = matchesAnyGlob;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-workspace configuration stored at `<workspace>/.excalibur/config.json`:
 * default tags applied to new files, glob patterns to exclude from listing and
 * search, and an auto-index toggle.
 */
class WorkspaceConfigStore {
    workspacePath;
    file;
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
        this.file = path.join(workspacePath, '.excalibur', 'config.json');
    }
    async get() {
        if (await fs.pathExists(this.file)) {
            try {
                return shared_1.WorkspaceConfigSchema.parse(await fs.readJson(this.file));
            }
            catch {
                return shared_1.WorkspaceConfigSchema.parse({});
            }
        }
        return shared_1.WorkspaceConfigSchema.parse({});
    }
    async update(partial) {
        const next = shared_1.WorkspaceConfigSchema.parse({ ...(await this.get()), ...partial });
        await fs.ensureDir(path.dirname(this.file));
        await (0, fs_utils_1.writeJsonAtomic)(this.file, next);
        return next;
    }
}
exports.WorkspaceConfigStore = WorkspaceConfigStore;
/**
 * Convert a simple glob (`*`, `**`, `?`) to a RegExp. `**` matches across path
 * separators; `*` matches within a segment; `?` matches a single char.
 */
function globToRegExp(glob) {
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
function matchesAnyGlob(relPath, globs) {
    const normalized = relPath.replace(/\\/g, '/');
    return globs.some((g) => globToRegExp(g).test(normalized) || globToRegExp(g).test(path.basename(normalized)));
}

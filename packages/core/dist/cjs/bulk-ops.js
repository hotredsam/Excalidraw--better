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
exports.bulkRename = bulkRename;
exports.bulkDelete = bulkDelete;
exports.bulkMove = bulkMove;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
/**
 * Guardrailed bulk file operations bounded to a workspace. Each item is checked
 * for traversal/danger before acting; a per-item result is returned so partial
 * failures are visible rather than aborting the whole batch.
 */
function safe(workspacePath, target) {
    return (0, path_utils_1.isPathWithin)(workspacePath, target) && !(0, path_utils_1.isDangerousPath)(target);
}
async function bulkRename(workspacePath, files, opts) {
    const details = [];
    let processed = 0;
    let failed = 0;
    let n = opts.startIndex ?? 1;
    for (const filePath of files) {
        try {
            if (!safe(workspacePath, filePath))
                throw new Error('outside workspace');
            const ext = path.extname(filePath);
            const base = path.basename(filePath, ext);
            const newName = (0, shared_1.applyRenameTemplate)(opts.template, { name: base, ext, n, padWidth: opts.padWidth });
            const dest = path.join(path.dirname(filePath), newName);
            if (!safe(workspacePath, dest))
                throw new Error('destination outside workspace');
            if (await fs.pathExists(dest))
                throw new Error('destination exists');
            await fs.move(filePath, dest);
            details.push({ path: filePath, result: dest });
            processed++;
        }
        catch (e) {
            details.push({ path: filePath, result: 'failed', error: e?.message || 'error' });
            failed++;
        }
        n++;
    }
    return { ok: failed === 0, processed, failed, details };
}
async function bulkDelete(workspacePath, files, deleter = (p) => fs.remove(p)) {
    const details = [];
    let processed = 0;
    let failed = 0;
    for (const filePath of files) {
        try {
            if (!(0, path_utils_1.isPathWithin)(workspacePath, filePath))
                throw new Error('outside workspace');
            await deleter(filePath);
            details.push({ path: filePath, result: 'deleted' });
            processed++;
        }
        catch (e) {
            details.push({ path: filePath, result: 'failed', error: e?.message || 'error' });
            failed++;
        }
    }
    return { ok: failed === 0, processed, failed, details };
}
async function bulkMove(workspacePath, files, destDir) {
    const details = [];
    let processed = 0;
    let failed = 0;
    if (!(0, path_utils_1.isWithinWorkspace)(workspacePath, destDir) || (0, path_utils_1.isDangerousPath)(destDir)) {
        return { ok: false, processed: 0, failed: files.length, details: files.map((p) => ({ path: p, result: 'failed', error: 'bad destination' })) };
    }
    await fs.ensureDir(destDir);
    for (const filePath of files) {
        try {
            if (!(0, path_utils_1.isPathWithin)(workspacePath, filePath))
                throw new Error('outside workspace');
            const dest = path.join(destDir, path.basename(filePath));
            if (await fs.pathExists(dest))
                throw new Error('destination exists');
            await fs.move(filePath, dest);
            details.push({ path: filePath, result: dest });
            processed++;
        }
        catch (e) {
            details.push({ path: filePath, result: 'failed', error: e?.message || 'error' });
            failed++;
        }
    }
    return { ok: failed === 0, processed, failed, details };
}

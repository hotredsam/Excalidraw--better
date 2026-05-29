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
exports.isPathWithin = isPathWithin;
exports.isWithinWorkspace = isWithinWorkspace;
exports.isDangerousPath = isDangerousPath;
exports.isSafeName = isSafeName;
exports.sanitizeName = sanitizeName;
const path = __importStar(require("path"));
/**
 * Validates if a target path is strictly within a base directory.
 * Prevents path traversal (../../) and outside-access.
 */
function isPathWithin(baseDir, targetPath) {
    const relative = path.relative(baseDir, targetPath);
    return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}
/**
 * Like {@link isPathWithin} but also accepts the base directory itself. Used for
 * directory-targeting operations (e.g. "create a file in the workspace root"),
 * where the workspace root is a legitimate, authorized location.
 */
function isWithinWorkspace(baseDir, targetPath) {
    return path.resolve(baseDir) === path.resolve(targetPath) || isPathWithin(baseDir, targetPath);
}
/**
 * Checks if a path is considered "dangerous" (e.g. System32, Program Files).
 *
 * Comparison is done on a forward-slash-normalized, lower-cased path so that the
 * blocklist matches regardless of backslash vs. slash separators on Windows.
 */
function isDangerousPath(targetPath) {
    const dangerousPrefixes = [
        'c:/windows',
        'c:/program files',
        'c:/program files (x86)',
        'c:/programdata',
        'c:/users/all users',
        '/etc',
        '/usr/bin',
        '/bin',
        '/sbin',
        '/system',
    ];
    const normalized = path
        .normalize(targetPath)
        .replace(/\\/g, '/')
        .toLowerCase();
    return dangerousPrefixes.some((p) => normalized === p || normalized.startsWith(p + '/'));
}
/** Reserved Windows device names that may not be used as filenames. */
const RESERVED_NAMES = new Set([
    'con', 'prn', 'aux', 'nul',
    'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
    'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
]);
const ILLEGAL_CHARS = /[<>:"/\\|?*]/;
const ILLEGAL_CHARS_G = /[<>:"/\\|?*]/g;
/**
 * Validates a single path segment (a file or folder name). Rejects empty names,
 * path separators, traversal, reserved device names, and illegal characters so
 * that user/AI-supplied names cannot escape their intended directory.
 * Spaces and hyphens inside a name are permitted.
 */
function isSafeName(name) {
    if (!name || name.length > 255)
        return false;
    if (name === '.' || name === '..')
        return false;
    if (ILLEGAL_CHARS.test(name))
        return false;
    if (name.endsWith(' ') || name.endsWith('.'))
        return false;
    const base = name.split('.')[0].toLowerCase();
    if (RESERVED_NAMES.has(base))
        return false;
    return true;
}
/** Sanitize an arbitrary string into a safe filename segment. */
function sanitizeName(name) {
    const cleaned = name
        .replace(ILLEGAL_CHARS_G, '')
        .replace(/\.+$/g, '')
        .trim();
    return cleaned || 'untitled';
}

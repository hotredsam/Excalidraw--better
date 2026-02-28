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
exports.isDangerousPath = isDangerousPath;
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
 * Checks if a path is considered "dangerous" (e.g. System32, Program Files)
 */
function isDangerousPath(targetPath) {
    const dangerousPrefixes = [
        'C:\Windows',
        'C:\Program Files',
        'C:\Program Files (x86)',
        'C:\Users\All Users',
    ];
    const normalized = path.normalize(targetPath).toLowerCase();
    return dangerousPrefixes.some(p => normalized.startsWith(p.toLowerCase()));
}

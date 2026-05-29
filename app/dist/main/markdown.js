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
exports.markdownPaths = markdownPaths;
exports.writeMarkdownBundle = writeMarkdownBundle;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
const export_utils_1 = require("./export-utils");
function markdownPaths(workspacePath, baseName, imageFormat) {
    const safe = (0, path_utils_1.sanitizeName)(baseName) || 'drawing';
    const exportsDir = path.join(workspacePath, 'exports');
    return {
        imagePath: path.join(exportsDir, `${safe}.${imageFormat}`),
        markdownPath: path.join(exportsDir, `${safe}.md`),
    };
}
async function writeMarkdownBundle(workspacePath, baseName, opts, imageData, scene, bodyText = '') {
    const { imagePath, markdownPath } = markdownPaths(workspacePath, baseName, opts.imageFormat);
    await fs.ensureDir(path.dirname(imagePath));
    if (opts.imageFormat === 'png') {
        await fs.writeFile(imagePath, (0, export_utils_1.embedSceneInPng)((0, export_utils_1.dataUrlToBuffer)(imageData), scene));
    }
    else {
        await fs.writeFile(imagePath, (0, export_utils_1.embedSceneInSvg)(imageData, scene), 'utf-8');
    }
    const md = (0, shared_1.buildMarkdown)(opts, `./${path.basename(imagePath)}`, bodyText);
    await fs.writeFile(markdownPath, md, 'utf-8');
    return { imagePath, markdownPath };
}

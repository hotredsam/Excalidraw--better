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
exports.mimeForExt = mimeForExt;
exports.buildImageInsertion = buildImageInsertion;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
/**
 * Import images (PNG/JPEG/SVG) onto the canvas as Excalidraw image elements.
 * The main process reads the bytes and produces a `BinaryFileData` entry plus a
 * matching image element; the renderer adds the file and inserts the element.
 */
const MIME = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};
function mimeForExt(ext) {
    return MIME[ext.toLowerCase()] || null;
}
async function buildImageInsertion(absPath, opts = {}) {
    const ext = path.extname(absPath).toLowerCase();
    const mimeType = mimeForExt(ext);
    if (!mimeType)
        throw new Error(`Unsupported image type: ${ext}`);
    const buf = await fs.readFile(absPath);
    const dataURL = `data:${mimeType};base64,${buf.toString('base64')}`;
    const fileId = (0, nanoid_1.nanoid)(20);
    const width = opts.width ?? 320;
    const height = opts.height ?? 240;
    const element = {
        id: (0, nanoid_1.nanoid)(20),
        type: 'image',
        x: opts.x ?? 0,
        y: opts.y ?? 0,
        width,
        height,
        angle: 0,
        strokeColor: 'transparent',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: Math.floor(Math.random() * 2 ** 31),
        version: 1,
        versionNonce: Math.floor(Math.random() * 2 ** 31),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        status: 'saved',
        fileId,
        scale: [1, 1],
    };
    return { file: { id: fileId, dataURL, mimeType, created: Date.now() }, element, mimeType };
}

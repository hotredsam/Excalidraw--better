import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
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
export function mimeForExt(ext) {
    return MIME[ext.toLowerCase()] || null;
}
export async function buildImageInsertion(absPath, opts = {}) {
    const ext = path.extname(absPath).toLowerCase();
    const mimeType = mimeForExt(ext);
    if (!mimeType)
        throw new Error(`Unsupported image type: ${ext}`);
    const buf = await fs.readFile(absPath);
    const dataURL = `data:${mimeType};base64,${buf.toString('base64')}`;
    const fileId = nanoid(20);
    const width = opts.width ?? 320;
    const height = opts.height ?? 240;
    const element = {
        id: nanoid(20),
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

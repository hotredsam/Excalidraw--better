"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeChunks = encodeChunks;
exports.embedSceneInPng = embedSceneInPng;
exports.embedSceneInSvg = embedSceneInSvg;
exports.dataUrlToBuffer = dataUrlToBuffer;
const png_chunks_extract_1 = __importDefault(require("png-chunks-extract"));
const png_chunk_text_1 = __importDefault(require("png-chunk-text"));
const crc_1 = __importDefault(require("crc"));
/**
 * Export helpers that guarantee Excalidraw-compatible *embedded scene* output.
 *
 * The renderer produces the visual PNG/SVG via Excalidraw's own export
 * utilities; these functions ensure the scene JSON is embedded so the exported
 * file round-trips back into the editor (matching the readers in
 * `excalidraw-utils.ts` and `png-excalidraw.ts`).
 */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** Re-encode an array of PNG chunks into a valid PNG buffer. */
function encodeChunks(chunks) {
    const parts = [PNG_SIGNATURE];
    for (const chunk of chunks) {
        const data = Buffer.from(chunk.data);
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length, 0);
        const name = Buffer.from(chunk.name, 'ascii');
        const crcBuf = Buffer.alloc(4);
        crcBuf.writeUInt32BE(crc_1.default.crc32(Buffer.concat([name, data])) >>> 0, 0);
        parts.push(length, name, data, crcBuf);
    }
    return Buffer.concat(parts);
}
/**
 * Embed (or replace) an Excalidraw scene in a PNG using a `tEXt` chunk keyed
 * `excalidraw`, inserted just before the IEND chunk.
 */
function embedSceneInPng(pngBuffer, scene) {
    const chunks = (0, png_chunks_extract_1.default)(pngBuffer);
    // Drop any pre-existing excalidraw text chunk so we don't duplicate.
    const filtered = chunks.filter((c) => {
        if (c.name !== 'tEXt')
            return true;
        try {
            return png_chunk_text_1.default.decode(c.data).keyword.toLowerCase() !== 'excalidraw';
        }
        catch {
            return true;
        }
    });
    const sceneChunk = png_chunk_text_1.default.encode('excalidraw', JSON.stringify(scene));
    const iendIndex = filtered.findIndex((c) => c.name === 'IEND');
    if (iendIndex === -1) {
        filtered.push(sceneChunk);
    }
    else {
        filtered.splice(iendIndex, 0, sceneChunk);
    }
    return encodeChunks(filtered);
}
const SVG_SCENE_RE = /<!-- excalidraw-state: .*? -->/;
/**
 * Embed (or replace) an Excalidraw scene in an SVG string as a single-line XML
 * comment, matching the reader in `excalidraw-utils.ts`.
 */
function embedSceneInSvg(svg, scene) {
    const comment = `<!-- excalidraw-state: ${JSON.stringify(scene)} -->`;
    if (SVG_SCENE_RE.test(svg)) {
        return svg.replace(SVG_SCENE_RE, comment);
    }
    // Insert right before the closing </svg> tag, or append if absent.
    const closeIdx = svg.lastIndexOf('</svg>');
    if (closeIdx === -1)
        return svg + '\n' + comment;
    return svg.slice(0, closeIdx) + comment + '\n' + svg.slice(closeIdx);
}
/** Decode a base64 data string (optionally with data-URL prefix) to a Buffer. */
function dataUrlToBuffer(data) {
    const comma = data.indexOf(',');
    const b64 = comma >= 0 && data.startsWith('data:') ? data.slice(comma + 1) : data;
    return Buffer.from(b64, 'base64');
}

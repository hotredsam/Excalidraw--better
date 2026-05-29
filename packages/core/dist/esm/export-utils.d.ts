interface Chunk {
    name: string;
    data: Uint8Array;
}
/** Re-encode an array of PNG chunks into a valid PNG buffer. */
export declare function encodeChunks(chunks: Chunk[]): Buffer;
/**
 * Embed (or replace) an Excalidraw scene in a PNG using a `tEXt` chunk keyed
 * `excalidraw`, inserted just before the IEND chunk.
 */
export declare function embedSceneInPng(pngBuffer: Buffer, scene: unknown): Buffer;
/**
 * Embed (or replace) an Excalidraw scene in an SVG string as a single-line XML
 * comment, matching the reader in `excalidraw-utils.ts`.
 */
export declare function embedSceneInSvg(svg: string, scene: unknown): string;
/** Decode a base64 data string (optionally with data-URL prefix) to a Buffer. */
export declare function dataUrlToBuffer(data: string): Buffer;
export {};

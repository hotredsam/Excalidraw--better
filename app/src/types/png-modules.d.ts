// Ambient declarations for PNG chunk utilities that ship without TypeScript types.
// These cover the minimal surface used by src/main/png-excalidraw.ts.

declare module 'png-chunks-extract' {
  export interface PngChunk {
    name: string;
    data: Uint8Array;
  }
  export default function extractChunks(data: Uint8Array | Buffer): PngChunk[];
}

declare module 'crc' {
  export function crc32(data: Uint8Array | Buffer | string, previous?: number): number;
  const crc: { crc32: typeof crc32; [key: string]: (...args: any[]) => number };
  export default crc;
}

declare module 'png-chunk-text' {
  export interface DecodedTextChunk {
    keyword: string;
    text: string;
  }
  export interface EncodedTextChunk {
    name: string;
    data: Uint8Array;
  }
  const text: {
    decode(data: Uint8Array | Buffer): DecodedTextChunk;
    encode(keyword: string, content: string): EncodedTextChunk;
  };
  export default text;
}

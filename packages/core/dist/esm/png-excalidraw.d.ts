import { ExcalidrawFile } from '@excalibur/shared';
export declare class PngExtractionError extends Error {
    code: 'NO_EMBEDDED_SCENE' | 'INVALID_JSON' | 'UNSUPPORTED_FORMAT' | 'PARSE_ERROR';
    constructor(code: 'NO_EMBEDDED_SCENE' | 'INVALID_JSON' | 'UNSUPPORTED_FORMAT' | 'PARSE_ERROR', message: string);
}
export declare function extractExcalidrawFromPng(buffer: Buffer): ExcalidrawFile;

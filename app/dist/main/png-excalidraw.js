"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PngExtractionError = void 0;
exports.extractExcalidrawFromPng = extractExcalidrawFromPng;
const png_chunks_extract_1 = __importDefault(require("png-chunks-extract"));
const png_chunk_text_1 = __importDefault(require("png-chunk-text"));
const pako_1 = __importDefault(require("pako"));
const shared_1 = require("@excalibur/shared");
class PngExtractionError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'PngExtractionError';
    }
}
exports.PngExtractionError = PngExtractionError;
function extractExcalidrawFromPng(buffer) {
    const chunks = (0, png_chunks_extract_1.default)(buffer);
    const metadataChunks = chunks.filter(chunk => chunk.name === 'tEXt' || chunk.name === 'zTXt' || chunk.name === 'iTXt');
    if (metadataChunks.length === 0) {
        throw new PngExtractionError('NO_EMBEDDED_SCENE', 'No metadata chunks found in PNG');
    }
    for (const chunk of metadataChunks) {
        let key = '';
        let value = '';
        try {
            if (chunk.name === 'tEXt') {
                const decoded = png_chunk_text_1.default.decode(chunk.data);
                key = decoded.keyword;
                value = decoded.text;
            }
            else if (chunk.name === 'zTXt') {
                // zTXt: keyword (1-79 bytes) + null separator (1 byte) + compression method (1 byte) + compressed text
                const data = chunk.data;
                let i = 0;
                while (i < data.length && data[i] !== 0 && i < 80)
                    i++;
                key = Buffer.from(data.slice(0, i)).toString('utf-8');
                const compressionMethod = data[i + 1];
                if (compressionMethod !== 0)
                    continue; // Only deflate is supported
                const compressedValue = data.slice(i + 2);
                value = pako_1.default.inflate(compressedValue, { to: 'string' });
            }
            // iTXt is more complex, skip for now unless needed
        }
        catch (err) {
            console.error(`Failed to decode PNG chunk ${chunk.name}:`, err);
            continue;
        }
        if (key.toLowerCase() === 'excalidraw' || key.toLowerCase() === 'comment') {
            try {
                const json = JSON.parse(value);
                return shared_1.ExcalidrawFileSchema.parse(json);
            }
            catch (err) {
                // If it looks like JSON but fails, we might want to keep looking or throw
                if (value.trim().startsWith('{')) {
                    throw new PngExtractionError('INVALID_JSON', 'Embedded Excalidraw data is not valid JSON');
                }
            }
        }
    }
    throw new PngExtractionError('NO_EMBEDDED_SCENE', 'No embedded Excalidraw scene found in PNG metadata');
}

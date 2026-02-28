import extractChunks from 'png-chunks-extract';
import text from 'png-chunk-text';
import pako from 'pako';
import { ExcalidrawFile, ExcalidrawFileSchema } from '@excalibur/shared';

export class PngExtractionError extends Error {
  constructor(public code: 'NO_EMBEDDED_SCENE' | 'INVALID_JSON' | 'UNSUPPORTED_FORMAT' | 'PARSE_ERROR', message: string) {
    super(message);
    this.name = 'PngExtractionError';
  }
}

export function extractExcalidrawFromPng(buffer: Buffer): ExcalidrawFile {
  const chunks = extractChunks(buffer);
  const metadataChunks = chunks.filter(chunk => chunk.name === 'tEXt' || chunk.name === 'zTXt' || chunk.name === 'iTXt');

  if (metadataChunks.length === 0) {
    throw new PngExtractionError('NO_EMBEDDED_SCENE', 'No metadata chunks found in PNG');
  }

  for (const chunk of metadataChunks) {
    let key: string = '';
    let value: string = '';

    try {
      if (chunk.name === 'tEXt') {
        const decoded = text.decode(chunk.data);
        key = decoded.keyword;
        value = decoded.text;
      } else if (chunk.name === 'zTXt') {
        // zTXt: keyword (1-79 bytes) + null separator (1 byte) + compression method (1 byte) + compressed text
        const data = chunk.data;
        let i = 0;
        while (i < data.length && data[i] !== 0 && i < 80) i++;
        key = Buffer.from(data.slice(0, i)).toString('utf-8');
        const compressionMethod = data[i + 1];
        if (compressionMethod !== 0) continue; // Only deflate is supported
        const compressedValue = data.slice(i + 2);
        value = pako.inflate(compressedValue, { to: 'string' });
      }
      // iTXt is more complex, skip for now unless needed
    } catch (err) {
      console.error(`Failed to decode PNG chunk ${chunk.name}:`, err);
      continue;
    }

    if (key.toLowerCase() === 'excalidraw' || key.toLowerCase() === 'comment') {
      try {
        const json = JSON.parse(value);
        return ExcalidrawFileSchema.parse(json);
      } catch (err) {
        // If it looks like JSON but fails, we might want to keep looking or throw
        if (value.trim().startsWith('{')) {
           throw new PngExtractionError('INVALID_JSON', 'Embedded Excalidraw data is not valid JSON');
        }
      }
    }
  }

  throw new PngExtractionError('NO_EMBEDDED_SCENE', 'No embedded Excalidraw scene found in PNG metadata');
}

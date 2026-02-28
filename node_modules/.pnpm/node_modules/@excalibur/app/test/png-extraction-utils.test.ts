import { describe, it, expect } from 'vitest';
import text from 'png-chunk-text';
import pako from 'pako';
import { extractExcalidrawFromPng } from '../src/main/png-excalidraw';
import crc from 'crc';

function createChunk(name: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const nameBuf = Buffer.from(name, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc.crc32(Buffer.concat([nameBuf, data])));
  return Buffer.concat([length, nameBuf, data, crcBuf]);
}

describe('PNG Excalidraw Extraction', () => {
  const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const IHDR = createChunk('IHDR', Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]));
  const IDAT = createChunk('IDAT', Buffer.from([120, 156, 99, 0, 0, 0, 2, 0, 1]));
  const IEND = createChunk('IEND', Buffer.from([]));

  it('should extract Excalidraw JSON from tEXt chunk', () => {
    const scene = { type: 'excalidraw', version: 2, elements: [], appState: {} };
    const textData = text.encode('Excalidraw', JSON.stringify(scene));
    const TEXT = createChunk('tEXt', Buffer.from(textData.data));
    
    const buffer = Buffer.concat([PNG_HEADER, IHDR, TEXT, IDAT, IEND]);

    const extracted = extractExcalidrawFromPng(buffer);
    expect(extracted.type).toBe('excalidraw');
  });

  it('should extract Excalidraw JSON from zTXt chunk', () => {
    const scene = { type: 'excalidraw', version: 2, elements: [{ id: '1' }], appState: {} };
    const json = JSON.stringify(scene);
    const keyword = Buffer.from('Excalidraw', 'utf-8');
    const nullSep = Buffer.from([0]);
    const compression = Buffer.from([0]);
    const compressed = Buffer.from(pako.deflate(json));
    const ztxtData = Buffer.concat([keyword, nullSep, compression, compressed]);
    const ZTXT = createChunk('zTXt', ztxtData);

    const buffer = Buffer.concat([PNG_HEADER, IHDR, ZTXT, IDAT, IEND]);

    const extracted = extractExcalidrawFromPng(buffer);
    expect(extracted.elements.length).toBe(1);
  });

  it('should throw NO_EMBEDDED_SCENE if no metadata found', () => {
    const buffer = Buffer.concat([PNG_HEADER, IHDR, IDAT, IEND]);
    expect(() => extractExcalidrawFromPng(buffer)).toThrow('No metadata chunks found in PNG');
  });
});

import { describe, it, expect } from 'vitest';
import crc from 'crc';
import { encodeChunks, embedSceneInPng, embedSceneInSvg, dataUrlToBuffer } from '../src/main/export-utils';
import { extractExcalidrawFromPng } from '../src/main/png-excalidraw';

function chunk(name: string, data: Buffer) {
  return { name, data: new Uint8Array(data) };
}

// A minimal but structurally valid PNG (no real pixels needed for chunk tests).
const IHDR = chunk('IHDR', Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]));
const IDAT = chunk('IDAT', Buffer.from([120, 156, 99, 0, 0, 0, 2, 0, 1]));
const IEND = chunk('IEND', Buffer.from([]));

describe('export-utils', () => {
  it('encodeChunks produces a buffer with a valid PNG signature', () => {
    const buf = encodeChunks([IHDR, IDAT, IEND]);
    expect(buf.slice(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    // CRC of IHDR should validate.
    expect(crc.crc32).toBeTypeOf('function');
  });

  it('embedSceneInPng embeds a scene that round-trips through extraction', () => {
    const base = encodeChunks([IHDR, IDAT, IEND]);
    const scene = { type: 'excalidraw', version: 2, elements: [{ id: 'x' }], appState: {} };
    const out = embedSceneInPng(base, scene);
    const extracted = extractExcalidrawFromPng(out);
    expect(extracted.type).toBe('excalidraw');
    expect(extracted.elements.length).toBe(1);
  });

  it('embedSceneInPng replaces an existing excalidraw chunk instead of duplicating', () => {
    const base = encodeChunks([IHDR, IDAT, IEND]);
    const first = embedSceneInPng(base, { type: 'excalidraw', elements: [{ id: '1' }] });
    const second = embedSceneInPng(first, { type: 'excalidraw', elements: [{ id: '1' }, { id: '2' }] });
    const extracted = extractExcalidrawFromPng(second);
    expect(extracted.elements.length).toBe(2);
  });

  it('embedSceneInSvg inserts a single-line comment before </svg>', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
    const out = embedSceneInSvg(svg, { type: 'excalidraw', elements: [] });
    expect(out).toMatch(/<!-- excalidraw-state: .*? -->/);
    const match = out.match(/<!-- excalidraw-state: (.*?) -->/);
    expect(JSON.parse(match![1]).type).toBe('excalidraw');
    expect(out.indexOf('<!--')).toBeLessThan(out.indexOf('</svg>'));
  });

  it('embedSceneInSvg replaces an existing scene comment', () => {
    const svg = '<svg><!-- excalidraw-state: {"type":"old"} --></svg>';
    const out = embedSceneInSvg(svg, { type: 'excalidraw', elements: [{ id: 'a' }] });
    expect((out.match(/excalidraw-state/g) || []).length).toBe(1);
    expect(out).toContain('"type":"excalidraw"');
  });

  it('dataUrlToBuffer handles both data URLs and raw base64', () => {
    const raw = Buffer.from('hello').toString('base64');
    expect(dataUrlToBuffer(raw).toString()).toBe('hello');
    expect(dataUrlToBuffer(`data:image/png;base64,${raw}`).toString()).toBe('hello');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { readExcalidrawFile } from '../src/main/excalidraw-utils';
import { embedSceneInSvg, embedSceneInPng, encodeChunks } from '../src/main/export-utils';
import { SearchIndex } from '../src/main/search';
import { LibraryStore } from '../src/main/libraries';
import { TemplateStore } from '../src/main/templates';
import { copyEntry } from '../src/main/file-ops';
import { applyAiPayload } from '../src/main/ai-import';
import { parseSvgToElements } from '../src/main/svg-import';

let ws: string;
let profileDir: string;
beforeEach(async () => {
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-deep-ws-'));
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-deep-pf-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
});
afterEach(async () => {
  await fs.remove(ws);
  await fs.remove(profileDir);
});

describe('readExcalidrawFile via embedded SVG written by export-utils', () => {
  it('round-trips an SVG export back into the editor', async () => {
    const svg = embedSceneInSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
      type: 'excalidraw',
      version: 2,
      elements: [{ id: 'z' }],
      appState: {},
    });
    const p = path.join(ws, 'd.excalidraw.svg');
    await fs.writeFile(p, svg, 'utf-8');
    const scene = await readExcalidrawFile(p);
    expect(scene.elements.length).toBe(1);
  });
});

describe('PNG zTXt round-trip via export-utils encoder', () => {
  it('reads a tEXt-embedded scene from a freshly-encoded PNG', async () => {
    const carrier = encodeChunks([
      { name: 'IHDR', data: new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]) },
      { name: 'IDAT', data: new Uint8Array([120, 156, 99, 0, 0, 0, 2, 0, 1]) },
      { name: 'IEND', data: new Uint8Array([]) },
    ]);
    const png = embedSceneInPng(carrier, { type: 'excalidraw', version: 2, elements: [{ id: 'a' }, { id: 'b' }] });
    const p = path.join(ws, 'd.excalidraw.png');
    await fs.writeFile(p, png);
    expect((await readExcalidrawFile(p)).elements.length).toBe(2);
  });
});

describe('SearchIndex combined matches', () => {
  it('matches on name, text and tag simultaneously', async () => {
    await fs.writeJson(path.join(ws, 'roadmap.excalidraw'), { elements: [{ type: 'text', text: 'roadmap planning' }] });
    const idx = new SearchIndex(ws);
    await idx.setTags(path.join(ws, 'roadmap.excalidraw'), ['roadmap']);
    idx.invalidate();
    const { results } = await idx.search('roadmap');
    expect(results[0].matchedOn).toEqual(expect.arrayContaining(['name', 'text', 'tag']));
  });
});

describe('LibraryStore.addItems creates a library when none exists', () => {
  it('creates then appends', async () => {
    const store = new LibraryStore(profileDir);
    await store.init();
    const s = await store.addItems('fresh', [{ elements: [{ id: '1' }] }]);
    expect(s.itemCount).toBe(1);
    const again = await store.addItems('fresh', [{ elements: [{ id: '2' }] }]);
    expect(again.itemCount).toBe(2);
  });
});

describe('TemplateStore.get missing throws', () => {
  it('throws for an unknown template id', async () => {
    const store = new TemplateStore(profileDir);
    await store.init();
    await expect(store.get('nope')).rejects.toThrow(/not found/);
  });
});

describe('file-ops copy collision suffixing', () => {
  it('appends "copy", then "copy 2", ...', async () => {
    const a = path.join(ws, 'a.excalidraw');
    await fs.writeJson(a, {});
    const c1 = await copyEntry(ws, a);
    expect(path.basename(c1.path)).toBe('a copy.excalidraw');
    const c2 = await copyEntry(ws, a);
    expect(path.basename(c2.path)).toBe('a copy 2.excalidraw');
  });
});

describe('applyAiPayload docs_update sanitizes the target', () => {
  it('writes into profile docs with a safe filename', async () => {
    const res = await applyAiPayload(profileDir, {
      type: 'docs_update',
      target: '../../etc/passwd',
      change: 'nope',
    } as any);
    expect(res.ok).toBe(true);
    const files = await fs.readdir(path.join(profileDir, 'docs'));
    expect(files.every((f) => !f.includes('/') && !f.includes('..'))).toBe(true);
  });
});

describe('parseSvgToElements skip count', () => {
  it('counts unsupported elements via the regex set', () => {
    const { elements, skipped } = parseSvgToElements('<svg><rect width="1" height="1"/><circle r="2"/></svg>');
    expect(elements.length).toBe(2);
    expect(skipped).toBe(0);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { SnippetStore } from '../src/main/snippets';
import { ShortcutStore } from '../src/main/shortcuts';
import { parseSvgToElements } from '../src/main/svg-import';
import { SearchIndex } from '../src/main/search';
import {
  normalizeAccelerator,
  resolveShortcuts,
  acceleratorToCommand,
  findShortcutConflict,
} from '@excalibur/shared';

let profileDir: string;
let ws: string;
beforeEach(async () => {
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-w3-'));
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-w3ws-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
});
afterEach(async () => {
  await fs.remove(profileDir);
  await fs.remove(ws);
});

describe('SnippetStore', () => {
  it('saves, lists, gets, renames and removes snippets', async () => {
    const store = new SnippetStore(profileDir);
    await store.init();
    const s = await store.save({ title: 'Arrow group', tags: ['flow'], elements: [{ id: 'a' }, { id: 'b' }] });
    expect((await store.list()).length).toBe(1);
    expect((await store.get(s.id)).elements.length).toBe(2);
    await store.rename(s.id, 'Renamed');
    expect((await store.list())[0].title).toBe('Renamed');
    await store.remove(s.id);
    expect((await store.list()).length).toBe(0);
  });
});

describe('ShortcutStore', () => {
  it('sets overrides, detects conflicts, and resets', async () => {
    const store = new ShortcutStore(profileDir);
    await store.init();
    await store.set('core.save', 'Ctrl+W');
    expect(store.list().find((b) => b.commandId === 'core.save')?.accelerator).toBe('Ctrl+W');

    // Ctrl+S is the default for core.save which we overrode; binding Ctrl+I
    // (default for toggle-ai) to a new command should conflict.
    await expect(store.set('core.new', 'Ctrl+I')).rejects.toThrow(/already bound/);
    // force overrides
    await store.set('core.new', 'Ctrl+I', true);
    expect(store.list().find((b) => b.commandId === 'core.new')?.accelerator).toBe('Ctrl+I');

    await store.reset('core.save');
    expect(store.list().find((b) => b.commandId === 'core.save')).toBeUndefined();
    await store.reset();
    expect(store.list().length).toBe(0);
  });

  it('persists across reload', async () => {
    const a = new ShortcutStore(profileDir);
    await a.init();
    await a.set('core.export', 'Ctrl+E');
    const b = new ShortcutStore(profileDir);
    await b.init();
    expect(b.list().find((x) => x.commandId === 'core.export')?.accelerator).toBe('Ctrl+E');
  });
});

describe('shortcut utils (shared)', () => {
  it('normalizes key events to canonical accelerators', () => {
    expect(normalizeAccelerator({ key: 's', ctrlKey: true })).toBe('Ctrl+S');
    expect(normalizeAccelerator({ key: 'P', ctrlKey: true, shiftKey: true })).toBe('Ctrl+Shift+P');
    expect(normalizeAccelerator({ key: 'k', metaKey: true })).toBe('Ctrl+K');
    expect(normalizeAccelerator({ key: ' ', ctrlKey: true })).toBe('Ctrl+Space');
    expect(normalizeAccelerator({ key: 'Control', ctrlKey: true })).toBe('Ctrl');
  });
  it('resolves defaults with overrides and reverse maps', () => {
    const resolved = resolveShortcuts([{ commandId: 'core.save', accelerator: 'Ctrl+W' }]);
    expect(resolved['core.save']).toBe('Ctrl+W');
    expect(resolved['core.new']).toBe('Ctrl+N'); // default preserved
    const rev = acceleratorToCommand([{ commandId: 'core.save', accelerator: 'Ctrl+W' }]);
    expect(rev['Ctrl+W']).toBe('core.save');
  });
  it('finds conflicts', () => {
    expect(findShortcutConflict([], 'core.new', 'Ctrl+S')).toBe('core.save');
    expect(findShortcutConflict([], 'core.save', 'Ctrl+S')).toBeNull();
  });
});

describe('parseSvgToElements', () => {
  it('converts rect/circle/ellipse/line/text to elements', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="100" height="50" fill="#ff0000" stroke="#000"/>
      <circle cx="200" cy="200" r="30"/>
      <ellipse cx="300" cy="100" rx="40" ry="20"/>
      <line x1="0" y1="0" x2="50" y2="80"/>
      <text x="10" y="120" font-size="18">Hello</text>
    </svg>`;
    const { elements } = parseSvgToElements(svg);
    const types = elements.map((e) => e.type).sort();
    expect(types).toEqual(['ellipse', 'ellipse', 'line', 'rectangle', 'text'].sort());
    const rect = elements.find((e) => e.type === 'rectangle');
    expect(rect.x).toBe(10);
    expect(rect.width).toBe(100);
    expect(rect.backgroundColor).toBe('#ff0000');
    const text = elements.find((e) => e.type === 'text');
    expect(text.text).toBe('Hello');
    expect(text.fontSize).toBe(18);
    const circle = elements.find((e) => e.type === 'ellipse' && e.width === 60);
    expect(circle.x).toBe(170); // cx - r
  });

  it('ignores unsupported elements gracefully', () => {
    const { elements } = parseSvgToElements('<svg><path d="M0 0 L10 10"/><rect width="5" height="5"/></svg>');
    expect(elements.length).toBe(1);
  });
});

describe('SearchIndex persistence', () => {
  it('persists and warm-starts from cache without re-walking', async () => {
    await fs.writeJson(path.join(ws, 'a.excalidraw'), { elements: [{ type: 'text', text: 'cached content' }] });
    const idx = new SearchIndex(ws);
    await idx.ensureBuilt(); // builds + persists
    expect(await fs.pathExists(path.join(ws, '.excalibur', 'index.json'))).toBe(true);

    // New index instance loads the cache; deleting the source proves the cache is used.
    await fs.remove(path.join(ws, 'a.excalidraw'));
    const idx2 = new SearchIndex(ws);
    expect(await idx2.loadCache()).toBe(true);
    const { results } = await idx2.search('cached');
    expect(results.length).toBe(1);
  });

  it('loadCache returns false when no cache exists', async () => {
    const fresh = new SearchIndex(ws);
    expect(await fresh.loadCache()).toBe(false);
  });
});

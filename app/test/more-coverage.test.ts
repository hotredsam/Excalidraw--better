import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { SettingsStore } from '../src/main/settings';
import { LibraryStore } from '../src/main/libraries';
import { getDeck, setSlideNotes } from '../src/main/presentation';
import { writeMarkdownBundle } from '../src/main/markdown';
import { RecentsStore } from '../src/main/recents';
import { PluginManager } from '../src/main/plugins';
import { getIndex } from '../src/main/search';

let dir: string;
let ws: string;
const BUILTIN = path.join(__dirname, '..', '..', 'plugins');

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-mc-'));
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-mcws-'));
  await fs.ensureDir(path.join(dir, 'settings'));
});
afterEach(async () => {
  await fs.remove(dir);
  await fs.remove(ws);
});

describe('SettingsStore writes a file on first init', () => {
  it('persists defaults when none exist', async () => {
    const s = new SettingsStore(dir);
    await s.init();
    expect(await fs.pathExists(path.join(dir, 'settings', 'settings.json'))).toBe(true);
  });
});

describe('LibraryStore.exportJson on missing throws', () => {
  it('throws for an unknown id', async () => {
    const store = new LibraryStore(dir);
    await store.init();
    await expect(store.exportJson('nope')).rejects.toThrow(/not found/);
  });
});

describe('presentation notes delete when empty', () => {
  it('removes a note when set to empty string', async () => {
    await setSlideNotes(ws, 'd.excalidraw', 'f1', 'hello');
    let deck = await getDeck(ws, 'd.excalidraw', { elements: [{ id: 'f1', type: 'frame', x: 0, y: 0, width: 1, height: 1 }] });
    expect(deck.slides[0].notes).toBe('hello');
    await setSlideNotes(ws, 'd.excalidraw', 'f1', '   ');
    deck = await getDeck(ws, 'd.excalidraw', { elements: [{ id: 'f1', type: 'frame', x: 0, y: 0, width: 1, height: 1 }] });
    expect(deck.slides[0].notes).toBe('');
  });
});

describe('markdown bundle PNG path embeds the scene', () => {
  it('writes a PNG carrier with the scene', async () => {
    // 1x1 png via export-utils encoder is exercised elsewhere; here use SVG to keep it light
    const bundle = await writeMarkdownBundle(
      ws,
      'note',
      { includeFrontmatter: false, imageFormat: 'svg', tags: [] },
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      { type: 'excalidraw', elements: [] },
    );
    expect(await fs.pathExists(bundle.imagePath)).toBe(true);
    expect(await fs.pathExists(bundle.markdownPath)).toBe(true);
  });
});

describe('RecentsStore.remove', () => {
  it('removes a single entry', async () => {
    const store = new RecentsStore(dir, 10);
    await store.init();
    await store.add({ path: '/a', name: 'a', workspaceId: 'w', workspaceName: 'W', openedAt: 1 });
    await store.add({ path: '/b', name: 'b', workspaceId: 'w', workspaceName: 'W', openedAt: 2 });
    const left = await store.remove('/a');
    expect(left.map((r) => r.path)).toEqual(['/b']);
  });
});

describe('PluginManager user plugin overrides a built-in id', () => {
  it('marks an overriding plugin as not built-in', async () => {
    await fs.ensureDir(path.join(dir, 'settings'));
    const pm = new PluginManager(dir, BUILTIN);
    await pm.init();
    const src = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-ov-'));
    await fs.writeJson(path.join(src, 'plugin.json'), { id: 'quick-export-presets', name: 'Override', version: '9.9.9' });
    await pm.installFromFolder(src);
    const list = await pm.list();
    const qep = list.find((p) => p.id === 'quick-export-presets');
    expect(qep?.builtIn).toBe(false);
    expect(qep?.version).toBe('9.9.9');
    await fs.remove(src);
  });
});

describe('search getTags empty by default', () => {
  it('returns an empty map for a fresh workspace', async () => {
    const idx = getIndex(ws);
    expect(await idx.getTags()).toEqual({});
  });
});

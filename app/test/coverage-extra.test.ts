import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { readExcalidrawFile } from '../src/main/excalidraw-utils';
import { CORE_COMMANDS, buildCommandList } from '../src/main/command-registry';
import { slideViewport, buildDeck } from '../src/main/presentation';
import { buildImageInsertion } from '../src/main/import-pack';
import { RecentsStore } from '../src/main/recents';
import { normalizeRawPayload, parseTextPayload } from '@excalibur/shared';

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-cov-'));
});
afterEach(async () => {
  await fs.remove(dir);
});

describe('readExcalidrawFile edge cases', () => {
  it('throws on unsupported extensions', async () => {
    const f = path.join(dir, 'note.txt');
    await fs.writeFile(f, 'hello');
    await expect(readExcalidrawFile(f)).rejects.toThrow(/Unsupported file type/);
  });
  it('throws a friendly error for an SVG without an embedded scene', async () => {
    const f = path.join(dir, 'plain.svg');
    await fs.writeFile(f, '<svg></svg>');
    await expect(readExcalidrawFile(f)).rejects.toThrow(/No embedded Excalidraw data/);
  });
  it('reads a .json scene and applies tolerant defaults', async () => {
    const f = path.join(dir, 'scene.json');
    await fs.writeJson(f, { elements: [{ id: '1' }], extra: 'kept' });
    const scene = await readExcalidrawFile(f);
    expect(scene.type).toBe('excalidraw');
    expect((scene as any).extra).toBe('kept');
  });
});

describe('command registry', () => {
  it('every core command has a unique id and title', () => {
    const ids = new Set(CORE_COMMANDS.map((c) => c.id));
    expect(ids.size).toBe(CORE_COMMANDS.length);
    expect(CORE_COMMANDS.every((c) => c.title.length > 0)).toBe(true);
  });
  it('buildCommandList without contributions returns the core set', () => {
    expect(buildCommandList()).toHaveLength(CORE_COMMANDS.length);
  });
});

describe('presentation helpers', () => {
  it('slideViewport pads the frame', () => {
    const vp = slideViewport({ id: 'a', name: 'A', index: 0, x: 100, y: 100, width: 200, height: 100, notes: '' }, 10);
    expect(vp).toEqual({ x: 90, y: 90, width: 220, height: 120 });
  });
  it('buildDeck wraps extractSlidesFromScene', () => {
    const deck = buildDeck({ elements: [{ id: 'f', type: 'frame', x: 0, y: 0, width: 10, height: 10 }] });
    expect(deck.slides.length).toBe(1);
  });
});

describe('import-pack defaults', () => {
  it('uses default dimensions when none provided', async () => {
    const png = path.join(dir, 'p.png');
    await fs.writeFile(png, Buffer.from([0x89, 0x50]));
    const ins = await buildImageInsertion(png);
    expect(ins.element.width).toBe(320);
    expect(ins.element.height).toBe(240);
  });
});

describe('RecentsStore.setLimit trims existing entries', () => {
  it('shrinks the list to the new limit', async () => {
    const store = new RecentsStore(dir, 5);
    await store.init();
    for (let i = 0; i < 5; i++) {
      await store.add({ path: '/f' + i, name: 'f' + i, workspaceId: 'w', workspaceName: 'W', openedAt: i });
    }
    store.setLimit(2);
    expect(store.list().length).toBe(2);
  });
});

describe('AI text payload parsing', () => {
  it('parses nested PERMISSIONS and FEATURES lists', () => {
    const parsed = parseTextPayload(
      ['TYPE: plugin_scaffold', 'NAME: x', 'PERMISSIONS:', '  filesystem: workspace-only', 'FEATURES:', '- one', '- two'].join('\n'),
    );
    expect(parsed.type).toBe('plugin_scaffold');
    expect(parsed.permissions.filesystem).toBe('workspace-only');
    expect(parsed.features).toEqual(['one', 'two']);
  });
  it('normalizeRawPayload returns null for empty input', () => {
    expect(normalizeRawPayload('   ')).toBeNull();
  });
  it('normalizeRawPayload passes through JSON objects', () => {
    expect(normalizeRawPayload('{"type":"docs_update","target":"x","change":"y"}')?.type).toBe('docs_update');
  });
});

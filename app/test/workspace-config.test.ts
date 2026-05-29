import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { WorkspaceConfigStore, globToRegExp, matchesAnyGlob } from '../src/main/workspace-config';
import { SearchIndex } from '../src/main/search';

let ws: string;
beforeEach(async () => {
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-wc-'));
});
afterEach(async () => {
  await fs.remove(ws);
});

describe('globToRegExp / matchesAnyGlob', () => {
  it('handles *, ** and ?', () => {
    expect(globToRegExp('*.png').test('a.png')).toBe(true);
    expect(globToRegExp('*.png').test('a.svg')).toBe(false);
    expect(globToRegExp('a/**').test('a/b/c.txt')).toBe(true);
    expect(globToRegExp('file?.txt').test('file1.txt')).toBe(true);
    expect(globToRegExp('file?.txt').test('file12.txt')).toBe(false);
  });
  it('matches against full path or basename', () => {
    expect(matchesAnyGlob('drafts/old.excalidraw', ['drafts/**'])).toBe(true);
    expect(matchesAnyGlob('a/b/scratch.excalidraw', ['scratch.excalidraw'])).toBe(true);
    expect(matchesAnyGlob('keep/file.excalidraw', ['drafts/**'])).toBe(false);
  });
});

describe('WorkspaceConfigStore', () => {
  it('returns defaults then persists updates', async () => {
    const store = new WorkspaceConfigStore(ws);
    expect((await store.get()).autoIndex).toBe(true);
    const updated = await store.update({ excludeGlobs: ['drafts/**'], defaultTags: ['wip'] });
    expect(updated.excludeGlobs).toEqual(['drafts/**']);
    const reread = await new WorkspaceConfigStore(ws).get();
    expect(reread.defaultTags).toEqual(['wip']);
  });
});

describe('SearchIndex respects excludes', () => {
  it('skips excluded files', async () => {
    await fs.writeJson(path.join(ws, 'keep.excalidraw'), { elements: [{ type: 'text', text: 'alpha' }] });
    await fs.ensureDir(path.join(ws, 'drafts'));
    await fs.writeJson(path.join(ws, 'drafts', 'wip.excalidraw'), { elements: [{ type: 'text', text: 'alpha' }] });

    const idx = new SearchIndex(ws);
    let res = await idx.search('alpha');
    expect(res.results.length).toBe(2);

    idx.setExcludes(['drafts/**']);
    res = await idx.search('alpha');
    expect(res.results.length).toBe(1);
    expect(res.results[0].name).toBe('keep.excalidraw');
  });
});

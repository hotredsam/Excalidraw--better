import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { SearchIndex } from '../src/main/search';

let ws: string;

beforeEach(async () => {
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-search-'));
  await fs.writeJson(path.join(ws, 'meeting-notes.excalidraw'), {
    type: 'excalidraw',
    elements: [{ type: 'text', text: 'Quarterly roadmap planning' }],
  });
  await fs.ensureDir(path.join(ws, 'diagrams'));
  await fs.writeJson(path.join(ws, 'diagrams', 'architecture.excalidraw'), {
    type: 'excalidraw',
    elements: [{ type: 'text', text: 'Service mesh and gateway' }],
  });
  await fs.ensureDir(path.join(ws, '.excalibur'));
});
afterEach(async () => {
  await fs.remove(ws);
});

describe('SearchIndex', () => {
  it('indexes excalidraw files recursively and returns all on empty query', async () => {
    const idx = new SearchIndex(ws);
    const { results, indexed } = await idx.search('');
    expect(indexed).toBe(2);
    expect(results.length).toBe(2);
  });

  it('matches by file name', async () => {
    const idx = new SearchIndex(ws);
    const { results } = await idx.search('meeting');
    expect(results.length).toBe(1);
    expect(results[0].matchedOn).toContain('name');
  });

  it('matches by embedded element text and returns a snippet', async () => {
    const idx = new SearchIndex(ws);
    const { results } = await idx.search('roadmap');
    expect(results.length).toBe(1);
    expect(results[0].matchedOn).toContain('text');
    expect(results[0].snippet).toMatch(/roadmap/);
  });

  it('stores and matches tags', async () => {
    const idx = new SearchIndex(ws);
    const target = path.join(ws, 'diagrams', 'architecture.excalidraw');
    await idx.setTags(target, ['backend', 'infra']);
    idx.invalidate();
    const { results } = await idx.search('infra');
    expect(results.length).toBe(1);
    expect(results[0].matchedOn).toContain('tag');
    expect(results[0].tags).toContain('backend');
  });

  it('clears tags when set to empty', async () => {
    const idx = new SearchIndex(ws);
    const target = path.join(ws, 'meeting-notes.excalidraw');
    await idx.setTags(target, ['x']);
    const after = await idx.setTags(target, []);
    expect(Object.keys(after).length).toBe(0);
  });
});

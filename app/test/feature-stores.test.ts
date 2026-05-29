import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { RecentsStore } from '../src/main/recents';
import { LibraryStore } from '../src/main/libraries';
import { BackupManager } from '../src/main/backup';
import { ReviewStore } from '../src/main/review';
import { computeStats } from '../src/main/stats';

let profileDir: string;
let workspace: string;

beforeEach(async () => {
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-fs-'));
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-fws-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
});
afterEach(async () => {
  await fs.remove(profileDir);
  await fs.remove(workspace);
});

describe('RecentsStore', () => {
  it('keeps most-recent-first, dedupes, and caps at the limit', async () => {
    const store = new RecentsStore(profileDir, 2);
    await store.init();
    const mk = (p: string) => ({ path: p, name: p, workspaceId: 'w', workspaceName: 'W', openedAt: Date.now() });
    await store.add(mk('/a'));
    await store.add(mk('/b'));
    await store.add(mk('/a')); // moves to front, dedup
    const list = await store.add(mk('/c')); // evicts oldest
    expect(list.map((r) => r.path)).toEqual(['/c', '/a']);
  });

  it('prunes missing files', async () => {
    const store = new RecentsStore(profileDir, 10);
    await store.init();
    const real = path.join(workspace, 'real.excalidraw');
    await fs.writeJson(real, { elements: [] });
    await store.add({ path: real, name: 'real', workspaceId: 'w', workspaceName: 'W', openedAt: 1 });
    await store.add({ path: '/does/not/exist', name: 'x', workspaceId: 'w', workspaceName: 'W', openedAt: 2 });
    const pruned = await store.prune();
    expect(pruned.map((r) => r.path)).toEqual([real]);
  });
});

describe('LibraryStore', () => {
  it('imports, lists, appends items and exports', async () => {
    const store = new LibraryStore(profileDir);
    await store.init();
    const src = path.join(workspace, 'pack.excalidrawlib');
    await fs.writeJson(src, { type: 'excalidrawlib', version: 2, libraryItems: [{ elements: [{ id: '1' }] }] });

    const summary = await store.importFromFile(src, 'My Pack');
    expect(summary.itemCount).toBe(1);

    await store.addItems(summary.id, [{ elements: [{ id: '2' }] }]);
    const lib = await store.get(summary.id);
    expect(lib.libraryItems.length).toBe(2);

    const json = await store.exportJson(summary.id);
    expect(JSON.parse(json).libraryItems.length).toBe(2);

    const list = await store.list();
    expect(list.length).toBe(1);
  });
});

describe('BackupManager', () => {
  it('snapshots before overwrite, caps history, and restores', async () => {
    const mgr = new BackupManager(profileDir, 2);
    await mgr.init();
    const file = path.join(workspace, 'doc.excalidraw');

    await fs.writeJson(file, { v: 1 });
    await mgr.backup(file);
    await fs.writeJson(file, { v: 2 });
    await mgr.backup(file);
    await fs.writeJson(file, { v: 3 });
    const third = await mgr.backup(file);

    const list = mgr.list(file);
    expect(list.length).toBe(2); // capped at keepPerFile

    // restore the most recent backup (v3 snapshot) over a clobbered file
    await fs.writeJson(file, { v: 99 });
    await mgr.restore(third!.id);
    expect((await fs.readJson(file)).v).toBe(3);
  });

  it('returns null when backing up a non-existent file', async () => {
    const mgr = new BackupManager(profileDir);
    await mgr.init();
    expect(await mgr.backup(path.join(workspace, 'nope.excalidraw'))).toBeNull();
  });
});

describe('ReviewStore', () => {
  it('adds pins, comments, resolves and deletes', async () => {
    const store = new ReviewStore(workspace);
    const file = path.join(workspace, 'd.excalidraw');
    await fs.writeJson(file, { elements: [] });

    let review = await store.addPin(file, 100, 200, 'Ana', 'Looks off here');
    const pinId = review.pins[0].id;
    expect(review.pins[0].comments.length).toBe(1);

    review = await store.addComment(file, pinId, 'Sam', 'Agreed');
    expect(review.pins[0].comments.length).toBe(2);

    review = await store.setResolved(file, pinId, true);
    expect(review.pins[0].resolved).toBe(true);

    review = await store.deletePin(file, pinId);
    expect(review.pins.length).toBe(0);
  });

  it('rejects files outside the workspace', async () => {
    const store = new ReviewStore(workspace);
    await expect(store.get('/etc/passwd')).rejects.toThrow(/outside workspace/);
  });
});

describe('computeStats', () => {
  it('aggregates counts, bytes, elements and tag histogram', async () => {
    await fs.writeJson(path.join(workspace, 'a.excalidraw'), { elements: [{ id: '1' }, { id: '2' }] });
    await fs.ensureDir(path.join(workspace, 'sub'));
    await fs.writeJson(path.join(workspace, 'sub', 'b.excalidraw'), { elements: [{ id: '3' }] });
    const stats = await computeStats(workspace, { 'a.excalidraw': ['x', 'y'], 'sub/b.excalidraw': ['x'] });
    expect(stats.totalFiles).toBe(2);
    expect(stats.totalElements).toBe(3);
    expect(stats.byExtension['.excalidraw']).toBe(2);
    expect(stats.tagHistogram['x']).toBe(2);
    expect(stats.largestFiles.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { WorkspaceStore } from '../src/main/workspace';
import { SettingsStore } from '../src/main/settings';
import { writeJsonAtomic } from '../src/main/fs-utils';
import { bulkRename } from '../src/main/bulk-ops';
import { LibraryStore } from '../src/main/libraries';
import { BackupManager } from '../src/main/backup';

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-se-'));
  await fs.ensureDir(path.join(dir, 'settings'));
});
afterEach(async () => {
  await fs.remove(dir);
});

describe('WorkspaceStore', () => {
  it('adds (deduping by path), sets active, and removes', async () => {
    const store = new WorkspaceStore(dir);
    await store.init();
    const a = await store.add('A', '/ws/a');
    const again = await store.add('A2', '/ws/a'); // same path -> dedup
    expect(again.id).toBe(a.id);
    await store.setActive(a.id);
    expect((await store.getActive())?.id).toBe(a.id);
    await store.remove(a.id);
    expect(await store.getActive()).toBeNull();
    expect((await store.list()).length).toBe(0);
  });

  it('persists across reload', async () => {
    const s1 = new WorkspaceStore(dir);
    await s1.init();
    const w = await s1.add('W', '/ws/w');
    await s1.setActive(w.id);
    const s2 = new WorkspaceStore(dir);
    await s2.init();
    expect((await s2.getActive())?.path).toBe('/ws/w');
  });

  it('rejects setting a non-existent active workspace', async () => {
    const store = new WorkspaceStore(dir);
    await store.init();
    await expect(store.setActive('nope')).rejects.toThrow(/not found/);
  });
});

describe('SettingsStore', () => {
  it('round-trips updates and clamps via schema on reload', async () => {
    const s = new SettingsStore(dir);
    await s.init();
    await s.update({ theme: 'light', recentsLimit: 50 });
    const s2 = new SettingsStore(dir);
    await s2.init();
    expect(s2.get().theme).toBe('light');
    expect(s2.get().recentsLimit).toBe(50);
  });
});

describe('writeJsonAtomic', () => {
  it('writes via a temp file then renames into place', async () => {
    const target = path.join(dir, 'nested', 'data.json');
    await writeJsonAtomic(target, { a: 1 });
    expect(await fs.readJson(target)).toEqual({ a: 1 });
    expect(await fs.pathExists(target + '.tmp')).toBe(false);
  });
});

describe('bulkRename conflict handling', () => {
  it('reports a failure when the destination already exists', async () => {
    await fs.writeJson(path.join(dir, 'a.excalidraw'), {});
    await fs.writeJson(path.join(dir, 'fixed.excalidraw'), {});
    const res = await bulkRename(dir, [path.join(dir, 'a.excalidraw')], { template: 'fixed', startIndex: 1, padWidth: 0 });
    expect(res.failed).toBe(1);
    expect(res.details[0].error).toMatch(/exists/);
  });
});

describe('LibraryStore malformed handling', () => {
  it('skips malformed library files in list()', async () => {
    const store = new LibraryStore(dir);
    await store.init();
    await fs.writeFile(path.join(dir, 'libraries', 'broken.excalidrawlib'), 'not json');
    await fs.writeJson(path.join(dir, 'libraries', 'good.excalidrawlib'), { type: 'excalidrawlib', version: 2, libraryItems: [] });
    const list = await store.list();
    expect(list.map((l) => l.id)).toEqual(['good']);
  });
});

describe('BackupManager restore-to-destination', () => {
  it('restores a snapshot to an explicit path', async () => {
    const mgr = new BackupManager(dir, 5);
    await mgr.init();
    const src = path.join(dir, 'orig.excalidraw');
    await fs.writeJson(src, { v: 1 });
    const entry = await mgr.backup(src);
    const dest = path.join(dir, 'restored.excalidraw');
    await mgr.restore(entry!.id, dest);
    expect((await fs.readJson(dest)).v).toBe(1);
  });
});

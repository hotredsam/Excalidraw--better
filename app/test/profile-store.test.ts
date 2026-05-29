import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';

const USER_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'excalibur-ps-'));
vi.mock('electron', () => ({
  app: { getPath: () => USER_DATA, getVersion: () => '0.1.0', isPackaged: false },
}));

import { ProfileStore } from '../src/main/profile';

afterEach(async () => {
  await fs.emptyDir(USER_DATA);
});

describe('ProfileStore', () => {
  it('creates a Default profile on first init and scaffolds folders', async () => {
    const store = new ProfileStore();
    await store.init();
    const active = await store.getActive();
    expect(active?.name).toBe('Default');
    const dir = store.getProfileDir(active!.id);
    for (const sub of ['settings', 'vault', 'libraries', 'templates', 'plugins']) {
      expect(await fs.pathExists(path.join(dir, sub))).toBe(true);
    }
  });

  it('creates, renames, switches and deletes profiles', async () => {
    const store = new ProfileStore();
    await store.init();
    const def = await store.getActive();
    const work = await store.create('Work');
    expect((await store.list()).length).toBe(2);

    await store.rename(work.id, 'Work2');
    expect((await store.list()).find((p) => p.id === work.id)?.name).toBe('Work2');

    await store.setActive(work.id);
    expect((await store.getActive())?.id).toBe(work.id);

    await store.delete(work.id);
    expect((await store.list()).length).toBe(1);
    expect((await store.getActive())?.id).toBe(def!.id);
  });

  it('refuses to delete the only profile', async () => {
    const store = new ProfileStore();
    await store.init();
    const active = await store.getActive();
    await expect(store.delete(active!.id)).rejects.toThrow(/only profile/);
  });

  it('persists profiles across reload', async () => {
    const s1 = new ProfileStore();
    await s1.init();
    await s1.create('Persisted');
    const s2 = new ProfileStore();
    await s2.init();
    expect((await s2.list()).some((p) => p.name === 'Persisted')).toBe(true);
  });
});

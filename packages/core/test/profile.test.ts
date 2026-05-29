import { describe, it, expect, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ProfileStore } from '../src/profile';

const DIRS: string[] = [];
async function tmpDir() {
  const d = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-core-profile-'));
  DIRS.push(d);
  return d;
}

afterEach(async () => {
  while (DIRS.length) await fs.remove(DIRS.pop()!);
});

describe('core ProfileStore (headless, injected base dir)', () => {
  it('scaffolds a Default profile under <userDataDir>/profiles on first init', async () => {
    const userData = await tmpDir();
    const store = new ProfileStore(userData);
    await store.init();
    const active = await store.getActive();
    expect(active?.name).toBe('Default');
    const dir = store.getProfileDir(active!.id);
    expect(dir.startsWith(path.join(userData, 'profiles'))).toBe(true);
    for (const sub of ['settings', 'vault', 'libraries', 'templates', 'plugins', 'index']) {
      expect(await fs.pathExists(path.join(dir, sub))).toBe(true);
    }
  });

  it('persists profiles and active selection across instances', async () => {
    const userData = await tmpDir();
    const a = new ProfileStore(userData);
    await a.init();
    const second = await a.create('Second');
    await a.setActive(second.id);

    const b = new ProfileStore(userData);
    await b.init();
    expect((await b.getActive())?.id).toBe(second.id);
    expect((await b.list()).map(p => p.name).sort()).toEqual(['Default', 'Second']);
  });

  it('refuses to delete the only profile', async () => {
    const userData = await tmpDir();
    const store = new ProfileStore(userData);
    await store.init();
    const only = (await store.list())[0];
    await expect(store.delete(only.id)).rejects.toThrow(/only profile/);
  });
});

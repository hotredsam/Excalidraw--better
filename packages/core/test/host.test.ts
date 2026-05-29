import { describe, it, expect } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { defaultHostServices } from '../src/host';

describe('defaultHostServices', () => {
  it('fills headless defaults and derives builtinPluginsDir from userDataDir', () => {
    const host = defaultHostServices({ userDataDir: '/tmp/excalibur-test' });
    expect(host.userDataDir).toBe('/tmp/excalibur-test');
    expect(host.builtinPluginsDir).toBe(path.join('/tmp/excalibur-test', 'builtin-plugins'));
    expect(host.platform).toBe(process.platform);
    expect(host.appVersion).toBe('0.0.0');
  });

  it('defaults userDataDir under the home directory when unspecified', () => {
    const host = defaultHostServices();
    expect(host.userDataDir).toBe(path.join(os.homedir(), '.excalibur'));
  });

  it('native pickers resolve to null and openExternal is a no-op when unsupported', async () => {
    const host = defaultHostServices();
    expect(await host.pickDirectory()).toBeNull();
    expect(await host.pickFile()).toBeNull();
    await expect(host.openExternal('https://example.com')).resolves.toBeUndefined();
  });

  it('trashItem falls back to a permanent delete', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-host-'));
    const file = path.join(dir, 'doomed.txt');
    await fs.writeFile(file, 'bye');
    const host = defaultHostServices();
    await host.trashItem(file);
    expect(await fs.pathExists(file)).toBe(false);
    await fs.remove(dir);
  });

  it('respects overrides for native capabilities', async () => {
    let opened = '';
    const host = defaultHostServices({
      appVersion: '1.2.3',
      openExternal: async (url) => { opened = url; },
      pickDirectory: async () => '/picked',
    });
    expect(host.appVersion).toBe('1.2.3');
    expect(await host.pickDirectory()).toBe('/picked');
    await host.openExternal('https://x.test');
    expect(opened).toBe('https://x.test');
  });
});

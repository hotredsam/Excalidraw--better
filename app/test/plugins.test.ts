import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { PluginManager } from '../src/main/plugins';

let profileDir: string;
let builtinDir: string;

const builtinManifest = {
  id: 'quick-export-presets',
  name: 'Quick Export Presets',
  version: '0.1.0',
  description: 'presets',
  permissions: { filesystem: 'workspace-only', network: 'none' },
  contributes: {
    exportPresets: [{ id: 'web', label: 'Web', format: 'png', scale: 1 }],
  },
};

beforeEach(async () => {
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-prof-'));
  builtinDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-builtin-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
  await fs.ensureDir(path.join(builtinDir, 'quick-export-presets'));
  await fs.writeJson(path.join(builtinDir, 'quick-export-presets', 'plugin.json'), builtinManifest);
});
afterEach(async () => {
  await fs.remove(profileDir);
  await fs.remove(builtinDir);
});

describe('PluginManager', () => {
  it('lists built-in plugins as enabled-by-default and builtIn', async () => {
    const pm = new PluginManager(profileDir, builtinDir);
    await pm.init();
    const plugins = await pm.list();
    expect(plugins.length).toBe(1);
    expect(plugins[0].builtIn).toBe(true);
    expect(plugins[0].enabled).toBe(true);
  });

  it('aggregates contributions from enabled plugins only', async () => {
    const pm = new PluginManager(profileDir, builtinDir);
    await pm.init();
    let contrib = await pm.getContributions();
    expect(contrib.exportPresets.length).toBe(1);
    expect(contrib.sourcePluginIds['web']).toBe('quick-export-presets');

    await pm.setEnabled('quick-export-presets', false);
    contrib = await pm.getContributions();
    expect(contrib.exportPresets.length).toBe(0);
  });

  it('installs a user plugin from a folder and can uninstall it', async () => {
    const src = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-src-'));
    await fs.writeJson(path.join(src, 'plugin.json'), {
      id: 'my-plugin',
      name: 'My Plugin',
      version: '1.0.0',
    });
    const pm = new PluginManager(profileDir, builtinDir);
    await pm.init();
    const installed = await pm.installFromFolder(src);
    expect(installed.id).toBe('my-plugin');
    expect(installed.enabled).toBe(true);

    let plugins = await pm.list();
    expect(plugins.find((p) => p.id === 'my-plugin')).toBeTruthy();

    await pm.uninstall('my-plugin');
    plugins = await pm.list();
    expect(plugins.find((p) => p.id === 'my-plugin')).toBeFalsy();
    await fs.remove(src);
  });

  it('rejects a folder without a valid manifest', async () => {
    const src = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-bad-'));
    const pm = new PluginManager(profileDir, builtinDir);
    await pm.init();
    await expect(pm.installFromFolder(src)).rejects.toThrow(/No valid plugin.json/);
    await fs.remove(src);
  });

  it('refuses to uninstall a built-in plugin', async () => {
    const pm = new PluginManager(profileDir, builtinDir);
    await pm.init();
    await expect(pm.uninstall('quick-export-presets')).rejects.toThrow(/Built-in/);
  });

  it('persists enablement across manager re-instantiation', async () => {
    const pm1 = new PluginManager(profileDir, builtinDir);
    await pm1.init();
    await pm1.setEnabled('quick-export-presets', false);

    const pm2 = new PluginManager(profileDir, builtinDir);
    await pm2.init();
    const plugins = await pm2.list();
    expect(plugins[0].enabled).toBe(false);
  });
});

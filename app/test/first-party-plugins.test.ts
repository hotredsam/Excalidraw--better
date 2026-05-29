import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { PluginManager } from '../src/main/plugins';
import { PluginManifestSchema } from '@excalibur/shared';

const PLUGINS_DIR = path.join(__dirname, '..', '..', 'plugins');

let profileDir: string;
beforeEach(async () => {
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-fp-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
});
afterEach(async () => {
  await fs.remove(profileDir);
});

describe('First-party plugins', () => {
  it('every shipped plugin.json is schema-valid', async () => {
    const dirs = (await fs.readdir(PLUGINS_DIR, { withFileTypes: true })).filter((d) => d.isDirectory());
    expect(dirs.length).toBeGreaterThanOrEqual(6);
    for (const d of dirs) {
      const manifestPath = path.join(PLUGINS_DIR, d.name, 'plugin.json');
      expect(await fs.pathExists(manifestPath), `${d.name} has a plugin.json`).toBe(true);
      const raw = await fs.readJson(manifestPath);
      const parsed = PluginManifestSchema.safeParse(raw);
      expect(parsed.success, `${d.name} manifest valid: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
      expect(raw.id).toBe(d.name); // folder name matches id
    }
  });

  it('PluginManager loads all first-party plugins as built-in', async () => {
    const pm = new PluginManager(profileDir, PLUGINS_DIR);
    await pm.init();
    const plugins = await pm.list();
    expect(plugins.length).toBeGreaterThanOrEqual(6);
    expect(plugins.every((p) => p.builtIn)).toBe(true);
    // quick-export-presets must contribute export presets
    const qep = plugins.find((p) => p.id === 'quick-export-presets');
    expect(qep?.contributes.exportPresets.length).toBeGreaterThan(0);
  });

  it('aggregated contributions expose the quick-export presets when enabled', async () => {
    const pm = new PluginManager(profileDir, PLUGINS_DIR);
    await pm.init();
    const contrib = await pm.getContributions();
    expect(contrib.exportPresets.find((p) => p.id === 'web')).toBeTruthy();
  });
});

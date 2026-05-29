import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';

// Mock Electron's `app` so the profile/store layer can run headless. The mocked
// userData dir is a fresh temp directory per test run.
const USER_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'excalibur-userdata-'));
vi.mock('electron', () => ({
  app: { getPath: () => USER_DATA, getVersion: () => '0.1.0', isPackaged: false },
}));

import { ProfileStore } from '../src/main/profile';
import { SettingsStore } from '../src/main/settings';
import { WorkspaceStore } from '../src/main/workspace';
import { PluginManager } from '../src/main/plugins';
import { createExcalidrawFile } from '../src/main/file-ops';
import { readExcalidrawFile } from '../src/main/excalidraw-utils';
import { embedSceneInPng, embedSceneInSvg, encodeChunks } from '../src/main/export-utils';
import { applyAiPayload } from '../src/main/ai-import';
import { getIndex } from '../src/main/search';

const BUILTIN = path.join(__dirname, '..', '..', 'plugins');

let workspaceDir: string;
beforeAll(async () => {
  workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-acc-ws-'));
});
afterAll(async () => {
  await fs.remove(workspaceDir);
  await fs.remove(USER_DATA);
});

/**
 * End-to-end acceptance test mirroring the Product Spec §10 checklist, driving
 * the real main-process stores wired together (no UI / no Electron runtime).
 */
describe('Acceptance: Product Spec §10', () => {
  it('1) creates 2 profiles with independent settings and plugin enablement', async () => {
    const profiles = new ProfileStore();
    await profiles.init(); // seeds "Default" + scaffolds folders
    const def = await profiles.getActive();
    expect(def).toBeTruthy();

    const work = await profiles.create('Work');
    expect((await profiles.list()).length).toBe(2);

    // Different settings per profile
    const defSettings = new SettingsStore(profiles.getProfileDir(def!.id));
    await defSettings.init();
    await defSettings.update({ showGrid: false, theme: 'dark' });

    const workSettings = new SettingsStore(profiles.getProfileDir(work.id));
    await workSettings.init();
    await workSettings.update({ showGrid: true, theme: 'light' });

    // Re-read independently to prove isolation
    const a = new SettingsStore(profiles.getProfileDir(def!.id));
    await a.init();
    const b = new SettingsStore(profiles.getProfileDir(work.id));
    await b.init();
    expect(a.get().showGrid).toBe(false);
    expect(b.get().showGrid).toBe(true);
    expect(b.get().theme).toBe('light');

    // Different plugin enablement per profile
    const defPlugins = new PluginManager(profiles.getProfileDir(def!.id), BUILTIN);
    await defPlugins.init();
    const workPlugins = new PluginManager(profiles.getProfileDir(work.id), BUILTIN);
    await workPlugins.init();

    const builtins = await defPlugins.list();
    expect(builtins.length).toBeGreaterThanOrEqual(2); // first-party plugins load

    await defPlugins.setEnabled('quick-export-presets', false);
    await workPlugins.setEnabled('quick-export-presets', true);

    const defReload = new PluginManager(profiles.getProfileDir(def!.id), BUILTIN);
    await defReload.init();
    const workReload = new PluginManager(profiles.getProfileDir(work.id), BUILTIN);
    await workReload.init();
    expect((await workReload.list()).find((p) => p.id === 'quick-export-presets')?.enabled).toBe(true);
    expect((await defReload.list()).find((p) => p.id === 'quick-export-presets')?.enabled).toBe(false);
  });

  it('2) opens a workspace, creates a drawing, saves, and reopens it', async () => {
    const profiles = new ProfileStore();
    await profiles.init();
    const active = await profiles.getActive();
    const workspaces = new WorkspaceStore(profiles.getProfileDir(active!.id));
    await workspaces.init();

    const ws = await workspaces.add('Vault', workspaceDir);
    await workspaces.setActive(ws.id);
    expect((await workspaces.getActive())?.path).toBe(workspaceDir);

    const { path: filePath } = await createExcalidrawFile(workspaceDir, workspaceDir, 'roadmap');
    // Simulate an edit + save
    const edited = {
      type: 'excalidraw',
      version: 2,
      elements: [{ id: 'a', type: 'text', text: 'Q3 launch plan' }],
      appState: {},
      files: {},
      customMeta: 'preserve-me',
    };
    await fs.writeFile(filePath, JSON.stringify(edited, null, 2), 'utf-8');

    // Reopen
    const reopened = await readExcalidrawFile(filePath);
    expect(reopened.elements.length).toBe(1);
    expect((reopened as any).customMeta).toBe('preserve-me');
  });

  it('3) exports PNG/SVG/JSON with embedded scene that re-opens', async () => {
    const scene = { type: 'excalidraw', version: 2, elements: [{ id: 'x' }], appState: {}, files: {} };

    // PNG: build a valid carrier PNG (correct CRCs), embed the scene, read back
    const carrier = encodeChunks([
      { name: 'IHDR', data: new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]) },
      { name: 'IDAT', data: new Uint8Array([120, 156, 99, 0, 0, 0, 2, 0, 1]) },
      { name: 'IEND', data: new Uint8Array([]) },
    ]);
    const minimalPng = embedSceneInPng(carrier, scene);
    const pngPath = path.join(workspaceDir, 'out.excalidraw.png');
    await fs.writeFile(pngPath, minimalPng);
    expect((await readExcalidrawFile(pngPath)).elements.length).toBe(1);

    // SVG
    const svg = embedSceneInSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>', scene);
    const svgPath = path.join(workspaceDir, 'out.excalidraw.svg');
    await fs.writeFile(svgPath, svg, 'utf-8');
    expect((await readExcalidrawFile(svgPath)).elements.length).toBe(1);

    // JSON
    const jsonPath = path.join(workspaceDir, 'out.excalidraw');
    await fs.writeFile(jsonPath, JSON.stringify(scene), 'utf-8');
    expect((await readExcalidrawFile(jsonPath)).type).toBe('excalidraw');
  });

  it('4) applies an AI plugin scaffold which then appears and enables', async () => {
    const profiles = new ProfileStore();
    await profiles.init();
    const active = await profiles.getActive();
    const profileDir = profiles.getProfileDir(active!.id);

    const res = await applyAiPayload(profileDir, {
      type: 'plugin_scaffold',
      name: 'Acceptance Tool',
      version: '0.1.0',
      description: 'generated in acceptance test',
      permissions: { filesystem: 'workspace-only', network: 'none' },
      features: ['Do a thing'],
    } as any);
    expect(res.ok).toBe(true);

    const pm = new PluginManager(profileDir, BUILTIN);
    await pm.init();
    const list = await pm.list();
    const scaffolded = list.find((p) => p.id === 'acceptance-tool');
    expect(scaffolded).toBeTruthy();

    await pm.setEnabled('acceptance-tool', true);
    const contrib = await pm.getContributions();
    expect(contrib.commands.find((c) => c.id === 'acceptance-tool-cmd-0')).toBeTruthy();
  });

  it('5) searches the workspace by embedded text', async () => {
    const idx = getIndex(workspaceDir);
    idx.invalidate();
    const { results } = await idx.search('Q3 launch');
    expect(results.some((r) => r.matchedOn.includes('text'))).toBe(true);
  });
});

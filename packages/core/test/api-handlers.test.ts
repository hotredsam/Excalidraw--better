import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ExcaliburEngine } from '../src/engine';
import { createApiHandlers } from '../src/api-handlers';
import { defaultHostServices, HostServices } from '../src/host';
import type { ExcaliburApi } from '@excalibur/api-contract';

let userData: string;
let workspaceDir: string;
let engine: ExcaliburEngine;
let api: ExcaliburApi;

beforeEach(async () => {
  userData = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-engine-'));
  workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-ws-'));
  const host: HostServices = defaultHostServices({
    userDataDir: userData,
    appVersion: '9.9.9',
    platform: 'test-os',
    // Simulate a native picker by returning the pre-created workspace dir.
    pickDirectory: async () => workspaceDir,
  });
  engine = new ExcaliburEngine(host);
  await engine.init();
  api = createApiHandlers(engine);
});

afterEach(async () => {
  await fs.remove(userData);
  await fs.remove(workspaceDir);
});

describe('createApiHandlers (headless, non-Electron host)', () => {
  it('reports app info from the host', async () => {
    expect(await api.app.ping()).toEqual({ ok: true, version: '9.9.9', platform: 'test-os' });
  });

  it('exposes the Default profile created on init', async () => {
    const { profiles } = await api.profiles.list();
    expect(profiles.map((p) => p.name)).toEqual(['Default']);
    expect((await api.profiles.getActive())?.name).toBe('Default');
  });

  it('adds a workspace via the host picker and round-trips a drawing file', async () => {
    const ws = await api.workspaces.add();
    expect(ws?.path).toBe(workspaceDir);
    await api.workspaces.setActive(ws!.id);

    const created = await api.workspaces.createFile(ws!.id, null, 'diagram');
    expect(created.path.endsWith('.excalidraw')).toBe(true);

    await api.workspaces.writeFile(ws!.id, created.path, '{"type":"excalidraw","elements":[]}');
    const content = await api.workspaces.readFile(ws!.id, created.path);
    expect(content).toContain('excalidraw');

    const files = await api.workspaces.listFiles(ws!.id);
    expect(files.some((f) => f.path === created.path)).toBe(true);
  });

  it('enforces the workspace sandbox on writes', async () => {
    const ws = await api.workspaces.add();
    await expect(
      api.workspaces.writeFile(ws!.id, path.join(os.tmpdir(), 'escape.excalidraw'), '{}'),
    ).rejects.toThrow(/Access denied/);
  });

  it('trashes a file through the host (permanent delete fallback)', async () => {
    const ws = await api.workspaces.add();
    const created = await api.workspaces.createFile(ws!.id, null, 'doomed');
    await api.workspaces.deleteFile(ws!.id, created.path);
    expect(await fs.pathExists(created.path)).toBe(false);
  });

  it('import handlers degrade to null when the host has no native file picker', async () => {
    const headless = createApiHandlers(engine, defaultHostServices({ userDataDir: userData }));
    expect(await headless.import.pickImage()).toBeNull();
    expect(await headless.import.pickSvgAsElements()).toBeNull();
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { StylePresetStore } from '../src/main/style-presets';
import { presetToAppState, appStateToPreset, StylePresetSchema } from '@excalibur/shared';

let profileDir: string;
beforeEach(async () => {
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-styles-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
});
afterEach(async () => {
  await fs.remove(profileDir);
});

describe('StylePresetStore', () => {
  it('saves (assigning an id), lists, updates and removes', async () => {
    const store = new StylePresetStore(profileDir);
    await store.init();
    const p = await store.save({ name: 'Red bold', strokeColor: '#ff0000', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 0 });
    expect(p.id).toBeTruthy();
    expect(store.list()).toHaveLength(1);

    await store.save({ id: p.id, name: 'Red bolder', strokeColor: '#ff0000', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 4, strokeStyle: 'solid', roughness: 0 });
    expect(store.list()).toHaveLength(1);
    expect(store.list()[0].name).toBe('Red bolder');

    await store.remove(p.id);
    expect(store.list()).toHaveLength(0);
  });

  it('persists across reload', async () => {
    const a = new StylePresetStore(profileDir);
    await a.init();
    await a.save({ name: 'X', strokeColor: '#111', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 1 });
    const b = new StylePresetStore(profileDir);
    await b.init();
    expect(b.list()).toHaveLength(1);
  });
});

describe('style <-> appState mapping', () => {
  it('round-trips through presetToAppState / appStateToPreset', () => {
    const preset = StylePresetSchema.parse({ id: 'a', name: 'A', strokeColor: '#abcabc', strokeWidth: 3, roughness: 2 });
    const appState = presetToAppState(preset);
    expect(appState.currentItemStrokeColor).toBe('#abcabc');
    expect(appState.currentItemStrokeWidth).toBe(3);
    const back = appStateToPreset(appState);
    expect(back.strokeColor).toBe('#abcabc');
    expect(back.roughness).toBe(2);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { validateRawPayload, normalizeRawPayload } from '@excalibur/shared';
import { applyAiPayload } from '../src/main/ai-import';

let profileDir: string;
beforeEach(async () => {
  profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-ai-'));
  await fs.ensureDir(path.join(profileDir, 'settings'));
});
afterEach(async () => {
  await fs.remove(profileDir);
});

describe('AI payload validation', () => {
  it('validates a settings_bundle JSON payload', () => {
    const raw = JSON.stringify({
      type: 'settings_bundle',
      name: 'defaults',
      settings: { autosave: false, showGrid: true },
    });
    const res = validateRawPayload(raw);
    expect(res.ok).toBe(true);
    expect(res.type).toBe('settings_bundle');
    expect(res.summary.length).toBeGreaterThan(0);
  });

  it('validates a template_pack JSON payload', () => {
    const raw = JSON.stringify({
      type: 'template_pack',
      name: 'work',
      templates: [{ id: 'a', title: 'A' }],
    });
    expect(validateRawPayload(raw).ok).toBe(true);
  });

  it('parses the TYPE: text format for plugin_scaffold', () => {
    const raw = [
      'TYPE: plugin_scaffold',
      'NAME: quick-export-presets',
      'VERSION: 0.1.0',
      'DESCRIPTION: Adds export presets.',
      'PERMISSIONS:',
      '  filesystem: workspace-only',
      '  network: none',
      'FEATURES:',
      '- Adds a toolbar button',
      '- Adds settings panel',
    ].join('\n');
    const normalized = normalizeRawPayload(raw);
    expect(normalized?.type).toBe('plugin_scaffold');
    const res = validateRawPayload(raw);
    expect(res.ok).toBe(true);
    expect((res.payload as any).features.length).toBe(2);
    expect((res.payload as any).permissions.filesystem).toBe('workspace-only');
  });

  it('rejects unknown types', () => {
    const res = validateRawPayload(JSON.stringify({ type: 'nonsense' }));
    expect(res.ok).toBe(false);
    expect(res.errors[0]).toMatch(/Unknown or missing payload/);
  });

  it('rejects malformed JSON / empty input', () => {
    expect(validateRawPayload('').ok).toBe(false);
    expect(validateRawPayload('{ not json').ok).toBe(false);
  });

  it('reports schema errors with field paths', () => {
    const res = validateRawPayload(JSON.stringify({ type: 'template_pack', name: 'x', templates: [] }));
    expect(res.ok).toBe(false);
    expect(res.errors.join(' ')).toMatch(/templates/);
  });
});

describe('applyAiPayload', () => {
  it('applies a template_pack into the profile templates folder', async () => {
    const res = await applyAiPayload(profileDir, {
      type: 'template_pack',
      name: 'work',
      version: '1.0.0',
      templates: [
        { id: 'meeting-notes', title: 'Meeting Notes', description: '', tags: ['work'] },
      ],
    } as any);
    expect(res.ok).toBe(true);
    expect(await fs.pathExists(path.join(profileDir, 'templates', 'meeting-notes.json'))).toBe(true);
  });

  it('scaffolds a plugin folder with a valid manifest and README', async () => {
    const res = await applyAiPayload(profileDir, {
      type: 'plugin_scaffold',
      name: 'My Tool',
      version: '0.1.0',
      description: 'does things',
      permissions: { filesystem: 'workspace-only', network: 'none' },
      features: ['Feature A', 'Feature B'],
    } as any);
    expect(res.ok).toBe(true);
    const manifest = await fs.readJson(path.join(profileDir, 'plugins', 'my-tool', 'plugin.json'));
    expect(manifest.id).toBe('my-tool');
    expect(manifest.contributes.commands.length).toBe(2);
    expect(await fs.pathExists(path.join(profileDir, 'plugins', 'my-tool', 'README.md'))).toBe(true);
  });

  it('applies a settings_bundle through the provided callback', async () => {
    const applied: any[] = [];
    const res = await applyAiPayload(
      profileDir,
      { type: 'settings_bundle', name: 'd', version: '1.0.0', applyTo: 'current_profile', settings: { autosave: false } } as any,
      async (partial) => { applied.push(partial); },
    );
    expect(res.ok).toBe(true);
    expect(applied[0]).toEqual({ autosave: false });
  });

  it('writes a docs_update proposal into the profile docs folder', async () => {
    const res = await applyAiPayload(profileDir, {
      type: 'docs_update',
      target: 'docs/AI_GUIDE.md',
      change: 'Add a section about plugins.',
    } as any);
    expect(res.ok).toBe(true);
    expect(await fs.pathExists(path.join(profileDir, 'docs', 'AI_GUIDE.md'))).toBe(true);
  });
});

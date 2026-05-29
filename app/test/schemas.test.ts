import { describe, it, expect } from 'vitest';
import {
  SettingsSchema,
  ProfileSchema,
  WorkspaceSchema,
  ExcalidrawFileSchema,
  PluginManifestSchema,
  PluginPermissionsSchema,
  ExportPresetSchema,
  AiPayloadSchema,
  StoredTemplateSchema,
  SnippetSchema,
  ShortcutMapSchema,
  WorkspaceConfigSchema,
  LibrarySchema,
  SlideSchema,
  ReviewSchema,
  WorkspaceStatsSchema,
  GitStatusSchema,
  CommandSchema,
  BackupEntrySchema,
  MarkdownOptionsSchema,
  RecentFileSchema,
} from '@excalibur/shared';

describe('Settings schema', () => {
  it('fills sensible defaults from an empty object', () => {
    const s = SettingsSchema.parse({});
    expect(s.autosave).toBe(true);
    expect(s.theme).toBe('dark');
    expect(s.recentsLimit).toBe(20);
    expect(s.backupsToKeep).toBe(10);
  });
  it('rejects out-of-range values', () => {
    expect(SettingsSchema.safeParse({ autosaveIntervalSeconds: 1 }).success).toBe(false);
    expect(SettingsSchema.safeParse({ recentsLimit: 0 }).success).toBe(false);
    expect(SettingsSchema.safeParse({ theme: 'neon' }).success).toBe(false);
  });
});

describe('ExcalidrawFile schema (tolerant)', () => {
  it('preserves unknown top-level fields (passthrough)', () => {
    const parsed = ExcalidrawFileSchema.parse({ elements: [], extraField: { a: 1 } });
    expect((parsed as any).extraField.a).toBe(1);
  });
  it('defaults type/version/elements', () => {
    const parsed = ExcalidrawFileSchema.parse({});
    expect(parsed.type).toBe('excalidraw');
    expect(Array.isArray(parsed.elements)).toBe(true);
  });
});

describe('Plugin schemas', () => {
  it('requires kebab-case ids', () => {
    expect(PluginManifestSchema.safeParse({ id: 'Bad Id', name: 'x', version: '1' }).success).toBe(false);
    expect(PluginManifestSchema.safeParse({ id: 'good-id', name: 'x', version: '1' }).success).toBe(true);
  });
  it('defaults permissions to none', () => {
    const p = PluginPermissionsSchema.parse({});
    expect(p.filesystem).toBe('none');
    expect(p.network).toBe('none');
  });
  it('validates export presets', () => {
    expect(ExportPresetSchema.safeParse({ id: 'x', label: 'X', format: 'pdf' }).success).toBe(false);
    expect(ExportPresetSchema.parse({ id: 'x', label: 'X', format: 'png' }).scale).toBe(1);
  });
});

describe('AI payload discriminated union', () => {
  it('accepts each valid type', () => {
    expect(AiPayloadSchema.safeParse({ type: 'settings_bundle', name: 'a', settings: {} }).success).toBe(true);
    expect(AiPayloadSchema.safeParse({ type: 'template_pack', name: 'a', templates: [{ id: 'x', title: 'X' }] }).success).toBe(true);
    expect(AiPayloadSchema.safeParse({ type: 'plugin_scaffold', name: 'a' }).success).toBe(true);
    expect(AiPayloadSchema.safeParse({ type: 'docs_update', target: 'd.md', change: 'x' }).success).toBe(true);
  });
  it('rejects unknown discriminant and missing required fields', () => {
    expect(AiPayloadSchema.safeParse({ type: 'nope' }).success).toBe(false);
    expect(AiPayloadSchema.safeParse({ type: 'template_pack', name: 'a', templates: [] }).success).toBe(false);
  });
});

describe('Feature schemas parse representative payloads', () => {
  it('StoredTemplate', () => {
    expect(StoredTemplateSchema.parse({ id: 'a', title: 'A' }).scene).toEqual({});
  });
  it('Snippet defaults createdAt and elements', () => {
    const s = SnippetSchema.parse({ id: 'a', title: 'A' });
    expect(Array.isArray(s.elements)).toBe(true);
    expect(typeof s.createdAt).toBe('number');
  });
  it('ShortcutMap', () => {
    expect(ShortcutMapSchema.parse({}).bindings).toEqual([]);
  });
  it('WorkspaceConfig', () => {
    const c = WorkspaceConfigSchema.parse({});
    expect(c.autoIndex).toBe(true);
    expect(c.excludeGlobs).toEqual([]);
  });
  it('Library defaults', () => {
    const l = LibrarySchema.parse({});
    expect(l.type).toBe('excalidrawlib');
    expect(l.libraryItems).toEqual([]);
  });
  it('Slide / Review / Stats / Git / Command / Backup / Markdown / Recent', () => {
    expect(SlideSchema.parse({ id: 'a', name: 'A', index: 0, x: 0, y: 0, width: 1, height: 1 }).notes).toBe('');
    expect(ReviewSchema.parse({}).pins).toEqual([]);
    expect(
      WorkspaceStatsSchema.safeParse({
        totalFiles: 0,
        byExtension: {},
        totalBytes: 0,
        totalElements: 0,
        tagHistogram: {},
        largestFiles: [],
        recentlyModified: [],
      }).success,
    ).toBe(true);
    expect(GitStatusSchema.parse({ isRepo: false }).clean).toBe(true);
    expect(CommandSchema.parse({ id: 'a', title: 'A' }).category).toBe('General');
    expect(
      BackupEntrySchema.safeParse({ id: 'a', originalPath: '/a', backupPath: '/b', createdAt: 1, size: 2 }).success,
    ).toBe(true);
    expect(MarkdownOptionsSchema.parse({}).imageFormat).toBe('png');
    expect(
      RecentFileSchema.safeParse({ path: '/a', name: 'a', workspaceId: 'w', workspaceName: 'W', openedAt: 1 }).success,
    ).toBe(true);
  });
});

describe('Profile / Workspace schemas', () => {
  it('require their identifying fields', () => {
    expect(ProfileSchema.safeParse({ id: 'a', name: 'A', createdAt: 1, updatedAt: 1, lastOpenedAt: 1 }).success).toBe(true);
    expect(ProfileSchema.safeParse({ name: 'A' }).success).toBe(false);
    expect(WorkspaceSchema.safeParse({ id: 'a', name: 'A', path: '/p', lastOpenedAt: 1 }).success).toBe(true);
  });
});

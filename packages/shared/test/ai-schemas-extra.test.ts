import { describe, it, expect } from 'vitest';
import { AiPayloadSchema } from '../src/index';

describe('AiPayloadSchema - AiPluginScaffoldSchema edge cases', () => {
  it('accepts plugin id with max length (64 chars)', () => {
    const maxId = 'a'.repeat(64);
    const payload = {
      type: 'plugin_scaffold' as const,
      id: maxId,
      name: 'Plugin',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.id).toBe(maxId);
      expect(parsed.id.length).toBe(64);
    }
  });

  it('rejects plugin id that exceeds max length (65 chars)', () => {
    const tooLongId = 'a'.repeat(65);
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: tooLongId,
      name: 'Plugin',
      code: 'const x = 1;',
    })).toThrow();
  });

  it('accepts plugin id with alphanumeric characters', () => {
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'Plugin123',
      name: 'Plugin',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.id).toBe('Plugin123');
    }
  });

  it('accepts plugin id with hyphens and underscores', () => {
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'my-plugin_v2',
      name: 'Plugin',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.id).toBe('my-plugin_v2');
    }
  });

  it('rejects plugin id with special characters', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: 'my-plugin@special',
      name: 'Plugin',
      code: 'const x = 1;',
    })).toThrow();
  });

  it('rejects plugin id with spaces', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: 'my plugin',
      name: 'Plugin',
      code: 'const x = 1;',
    })).toThrow();
  });

  it('rejects plugin id with dots', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: 'my.plugin',
      name: 'Plugin',
      code: 'const x = 1;',
    })).toThrow();
  });

  it('accepts plugin with code at max length (1,000,000 chars)', () => {
    const maxCode = 'a'.repeat(1_000_000);
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'plugin',
      name: 'Plugin',
      code: maxCode,
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.code.length).toBe(1_000_000);
    }
  });

  it('rejects plugin with code exceeding max length', () => {
    const tooLongCode = 'a'.repeat(1_000_001);
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: 'plugin',
      name: 'Plugin',
      code: tooLongCode,
    })).toThrow();
  });

  it('accepts entry with .js extension', () => {
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'plugin',
      name: 'Plugin',
      entry: 'index.js',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.entry).toBe('index.js');
    }
  });

  it('accepts entry with .mjs extension', () => {
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'plugin',
      name: 'Plugin',
      entry: 'index.mjs',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.entry).toBe('index.mjs');
    }
  });

  it('accepts entry with .ts extension', () => {
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'plugin',
      name: 'Plugin',
      entry: 'index.ts',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.entry).toBe('index.ts');
    }
  });

  it('accepts entry with alphanumeric, dots, hyphens, underscores', () => {
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'plugin',
      name: 'Plugin',
      entry: 'my-entry_v2.0.js',
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.entry).toBe('my-entry_v2.0.js');
    }
  });

  it('rejects entry with path separators', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: 'plugin',
      name: 'Plugin',
      entry: 'src/index.js',
      code: 'const x = 1;',
    })).toThrow();
  });

  it('accepts plugin with max name length (128 chars)', () => {
    const maxName = 'P'.repeat(128);
    const payload = {
      type: 'plugin_scaffold' as const,
      id: 'plugin',
      name: maxName,
      code: 'const x = 1;',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'plugin_scaffold') {
      expect(parsed.name.length).toBe(128);
    }
  });

  it('rejects plugin with name exceeding max length', () => {
    const tooLongName = 'P'.repeat(129);
    expect(() => AiPayloadSchema.parse({
      type: 'plugin_scaffold',
      id: 'plugin',
      name: tooLongName,
      code: 'const x = 1;',
    })).toThrow();
  });
});

describe('AiPayloadSchema - AiDocsUpdateSchema edge cases', () => {
  it('accepts filename with .md extension', () => {
    const payload = {
      type: 'docs_update' as const,
      filename: 'README.md',
      content: '# Documentation',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'docs_update') {
      expect(parsed.filename).toBe('README.md');
    }
  });

  it('accepts filename with multiple dots', () => {
    const payload = {
      type: 'docs_update' as const,
      filename: 'user-guide.v2.0.md',
      content: '# Guide',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'docs_update') {
      expect(parsed.filename).toBe('user-guide.v2.0.md');
    }
  });

  it('accepts filename with hyphens and underscores', () => {
    const payload = {
      type: 'docs_update' as const,
      filename: 'my-doc_v1.md',
      content: '# Docs',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'docs_update') {
      expect(parsed.filename).toBe('my-doc_v1.md');
    }
  });

  it('rejects filename with path separators (forward slash)', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'docs_update',
      filename: 'docs/README.md',
      content: '# Guide',
    })).toThrow();
  });

  it('rejects filename with path separators (backslash)', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'docs_update',
      filename: 'docs\\README.md',
      content: '# Guide',
    })).toThrow();
  });

  it('rejects filename with special characters', () => {
    expect(() => AiPayloadSchema.parse({
      type: 'docs_update',
      filename: 'file@special.md',
      content: '# Guide',
    })).toThrow();
  });

  it('accepts filename at max length (255 chars)', () => {
    const maxFilename = 'f'.repeat(255);
    const payload = {
      type: 'docs_update' as const,
      filename: maxFilename,
      content: '# Docs',
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'docs_update') {
      expect(parsed.filename.length).toBe(255);
    }
  });

  it('rejects filename exceeding max length (256 chars)', () => {
    const tooLongFilename = 'f'.repeat(256);
    expect(() => AiPayloadSchema.parse({
      type: 'docs_update',
      filename: tooLongFilename,
      content: '# Docs',
    })).toThrow();
  });

  it('accepts content with large size (up to 10MB)', () => {
    const largeContent = 'x'.repeat(1_000_000);
    const payload = {
      type: 'docs_update' as const,
      filename: 'large.md',
      content: largeContent,
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'docs_update') {
      expect(parsed.content.length).toBe(1_000_000);
    }
  });

  it('rejects content exceeding max length', () => {
    const tooLargeContent = 'x'.repeat(10_000_001);
    expect(() => AiPayloadSchema.parse({
      type: 'docs_update',
      filename: 'large.md',
      content: tooLargeContent,
    })).toThrow();
  });
});

describe('AiPayloadSchema - AiSettingsBundleSchema edge cases', () => {
  it('accepts settings with nested object values', () => {
    const payload = {
      type: 'settings_bundle' as const,
      settings: {
        ui: {
          theme: 'dark',
          sidebar: { width: 250, position: 'left' },
        },
      },
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'settings_bundle') {
      expect((parsed.settings as any).ui.sidebar.width).toBe(250);
    }
  });

  it('accepts settings with array values', () => {
    const payload = {
      type: 'settings_bundle' as const,
      settings: {
        shortcuts: [
          { key: 'Ctrl+S', action: 'save' },
          { key: 'Ctrl+Z', action: 'undo' },
        ],
      },
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'settings_bundle') {
      expect((parsed.settings as any).shortcuts).toHaveLength(2);
    }
  });

  it('accepts settings with mixed value types', () => {
    const payload = {
      type: 'settings_bundle' as const,
      settings: {
        stringVal: 'text',
        numberVal: 42,
        boolVal: true,
        nullVal: null,
        arrayVal: [1, 2, 3],
        objectVal: { key: 'value' },
      },
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'settings_bundle') {
      expect((parsed.settings as any).stringVal).toBe('text');
      expect((parsed.settings as any).numberVal).toBe(42);
      expect((parsed.settings as any).boolVal).toBe(true);
    }
  });
});

describe('AiPayloadSchema - AiTemplatePack edge cases', () => {
  it('accepts template pack with exactly 1 template (min 1)', () => {
    const payload = {
      type: 'template_pack' as const,
      name: 'Single',
      templates: [
        { name: 'basic', content: '{}' },
      ],
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'template_pack') {
      expect(parsed.templates).toHaveLength(1);
    }
  });

  it('accepts template pack with 10 templates', () => {
    const templates = Array.from({ length: 10 }, (_, i) => ({
      name: `template-${i}`,
      content: `{ "id": "${i}" }`,
    }));
    const payload = {
      type: 'template_pack' as const,
      name: 'Many Templates',
      templates,
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'template_pack') {
      expect(parsed.templates).toHaveLength(10);
      expect(parsed.templates[5].name).toBe('template-5');
    }
  });

  it('accepts template pack with 100 templates', () => {
    const templates = Array.from({ length: 100 }, (_, i) => ({
      name: `t${i}`,
      content: `content${i}`,
    }));
    const payload = {
      type: 'template_pack' as const,
      name: 'Large Pack',
      templates,
    };
    const parsed = AiPayloadSchema.parse(payload);
    if (parsed.type === 'template_pack') {
      expect(parsed.templates).toHaveLength(100);
    }
  });
});

describe('AiPayloadSchema - round-trip parsing', () => {
  it('plugin_scaffold round-trips through parse', () => {
    const original = {
      type: 'plugin_scaffold' as const,
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.2.3',
      description: 'A test plugin',
      entry: 'index.js',
      code: 'module.exports = {};',
      manifest: { keywords: ['test'] },
    };
    const parsed = AiPayloadSchema.parse(original);
    const reparsed = AiPayloadSchema.parse(parsed);
    if (reparsed.type === 'plugin_scaffold') {
      expect(reparsed.id).toBe(original.id);
      expect(reparsed.name).toBe(original.name);
      expect(reparsed.version).toBe(original.version);
    }
  });

  it('template_pack round-trips through parse', () => {
    const original = {
      type: 'template_pack' as const,
      name: 'Templates',
      templates: [
        { name: 'flow', content: '{"type":"flow"}' },
        { name: 'mind', content: '{"type":"mind"}' },
      ],
    };
    const parsed = AiPayloadSchema.parse(original);
    const reparsed = AiPayloadSchema.parse(parsed);
    if (reparsed.type === 'template_pack') {
      expect(reparsed.templates).toHaveLength(2);
      expect(reparsed.templates[0].name).toBe('flow');
    }
  });

  it('settings_bundle round-trips through parse', () => {
    const original = {
      type: 'settings_bundle' as const,
      settings: {
        theme: 'dark',
        fontSize: 14,
        features: ['beta', 'experimental'],
      },
    };
    const parsed = AiPayloadSchema.parse(original);
    const reparsed = AiPayloadSchema.parse(parsed);
    if (reparsed.type === 'settings_bundle') {
      expect((reparsed.settings as any).theme).toBe('dark');
      expect((reparsed.settings as any).features).toHaveLength(2);
    }
  });

  it('docs_update round-trips through parse', () => {
    const original = {
      type: 'docs_update' as const,
      filename: 'GUIDE.md',
      content: '# Guide\n\nThis is a guide.',
    };
    const parsed = AiPayloadSchema.parse(original);
    const reparsed = AiPayloadSchema.parse(parsed);
    if (reparsed.type === 'docs_update') {
      expect(reparsed.filename).toBe('GUIDE.md');
      expect(reparsed.content).toContain('Guide');
    }
  });
});

import { describe, it, expect } from 'vitest';
import { PluginInfoSchema, PluginInfoListSchema, AiPayloadSchema } from '../src/index';

describe('PluginInfoSchema', () => {
  it('accepts valid plugin info', () => {
    const plugin = {
      id: 'my-plugin',
      name: 'My Plugin',
      version: '1.0.0',
      enabled: false,
      path: '/plugins/my-plugin',
    };
    const parsed = PluginInfoSchema.parse(plugin);
    expect(parsed.id).toBe('my-plugin');
    expect(parsed.enabled).toBe(false);
  });

  it('accepts optional description and author', () => {
    const plugin = {
      id: 'p',
      name: 'P',
      version: '0.1.0',
      enabled: true,
      path: '/p',
      description: 'A plugin',
      author: 'Me',
    };
    const parsed = PluginInfoSchema.parse(plugin);
    expect(parsed.description).toBe('A plugin');
    expect(parsed.author).toBe('Me');
  });

  it('rejects plugin without id', () => {
    expect(() => PluginInfoSchema.parse({
      name: 'x',
      version: '0.1.0',
      enabled: true,
      path: '/',
    })).toThrow();
  });

  it('rejects plugin without name', () => {
    expect(() => PluginInfoSchema.parse({
      id: 'test-plugin',
      version: '0.1.0',
      enabled: true,
      path: '/',
    })).toThrow();
  });

  it('rejects plugin without version', () => {
    expect(() => PluginInfoSchema.parse({
      id: 'test-plugin',
      name: 'Test',
      enabled: true,
      path: '/',
    })).toThrow();
  });

  it('rejects plugin without enabled field', () => {
    expect(() => PluginInfoSchema.parse({
      id: 'test-plugin',
      name: 'Test',
      version: '1.0.0',
      path: '/',
    })).toThrow();
  });

  it('rejects plugin without path', () => {
    expect(() => PluginInfoSchema.parse({
      id: 'test-plugin',
      name: 'Test',
      version: '1.0.0',
      enabled: true,
    })).toThrow();
  });

  it('parses plugin with all fields', () => {
    const plugin = PluginInfoSchema.parse({
      id: 'awesome-plugin',
      name: 'Awesome Plugin',
      version: '2.5.3',
      description: 'Does awesome things',
      author: 'John Doe',
      enabled: true,
      path: '/home/user/.excalibur/plugins/awesome-plugin',
    });
    expect(plugin.id).toBe('awesome-plugin');
    expect(plugin.name).toBe('Awesome Plugin');
    expect(plugin.version).toBe('2.5.3');
    expect(plugin.description).toBe('Does awesome things');
    expect(plugin.author).toBe('John Doe');
    expect(plugin.enabled).toBe(true);
    expect(plugin.path).toBe('/home/user/.excalibur/plugins/awesome-plugin');
  });

  it('handles enabled as false', () => {
    const plugin = PluginInfoSchema.parse({
      id: 'disabled-plugin',
      name: 'Disabled Plugin',
      version: '1.0.0',
      enabled: false,
      path: '/plugins/disabled',
    });
    expect(plugin.enabled).toBe(false);
  });

  it('accepts description without author', () => {
    const plugin = PluginInfoSchema.parse({
      id: 'plugin1',
      name: 'Plugin One',
      version: '1.0.0',
      enabled: true,
      path: '/plugins/p1',
      description: 'A description',
    });
    expect(plugin.description).toBe('A description');
    expect(plugin.author).toBeUndefined();
  });

  it('accepts author without description', () => {
    const plugin = PluginInfoSchema.parse({
      id: 'plugin2',
      name: 'Plugin Two',
      version: '1.0.0',
      enabled: true,
      path: '/plugins/p2',
      author: 'Unknown',
    });
    expect(plugin.author).toBe('Unknown');
    expect(plugin.description).toBeUndefined();
  });
});

describe('PluginInfoListSchema', () => {
  it('accepts empty plugins list', () => {
    const list = PluginInfoListSchema.parse({ plugins: [] });
    expect(list.plugins).toHaveLength(0);
  });

  it('accepts list with single plugin', () => {
    const list = PluginInfoListSchema.parse({
      plugins: [
        {
          id: 'plugin1',
          name: 'Plugin 1',
          version: '1.0.0',
          enabled: true,
          path: '/plugins/p1',
        },
      ],
    });
    expect(list.plugins).toHaveLength(1);
    expect(list.plugins[0].id).toBe('plugin1');
  });

  it('accepts list with multiple plugins', () => {
    const list = PluginInfoListSchema.parse({
      plugins: [
        {
          id: 'plugin1',
          name: 'Plugin 1',
          version: '1.0.0',
          enabled: true,
          path: '/plugins/p1',
        },
        {
          id: 'plugin2',
          name: 'Plugin 2',
          version: '2.0.0',
          enabled: false,
          path: '/plugins/p2',
          description: 'Second plugin',
        },
      ],
    });
    expect(list.plugins).toHaveLength(2);
    expect(list.plugins[1].description).toBe('Second plugin');
  });

  it('rejects list without plugins field', () => {
    expect(() => PluginInfoListSchema.parse({})).toThrow();
  });

  it('rejects list with invalid plugin', () => {
    expect(() => PluginInfoListSchema.parse({
      plugins: [
        {
          id: 'plugin1',
          name: 'Plugin 1',
          version: '1.0.0',
          // missing enabled field
          path: '/plugins/p1',
        },
      ],
    })).toThrow();
  });
});

describe('AiPayloadSchema', () => {
  describe('plugin_scaffold payload', () => {
    it('validates plugin_scaffold payload with all fields', () => {
      const payload = {
        type: 'plugin_scaffold',
        id: 'my-plugin',
        name: 'My Plugin',
        version: '0.1.0',
        description: 'A sample plugin',
        entry: 'index.js',
        code: 'module.exports = { onLoad() {} }',
        manifest: { keywords: ['drawing', 'plugin'] },
      };
      const parsed = AiPayloadSchema.parse(payload);
      expect(parsed.type).toBe('plugin_scaffold');
      if (parsed.type === 'plugin_scaffold') {
        expect(parsed.id).toBe('my-plugin');
        expect(parsed.code).toBe('module.exports = { onLoad() {} }');
        expect(parsed.description).toBe('A sample plugin');
      }
    });

    it('validates plugin_scaffold with minimal required fields', () => {
      const payload = {
        type: 'plugin_scaffold',
        id: 'my-plugin',
        name: 'My Plugin',
        version: 'not-specified',
        code: 'console.log("hello");',
      };
      const parsed = AiPayloadSchema.parse(payload);
      expect(parsed.type).toBe('plugin_scaffold');
      if (parsed.type === 'plugin_scaffold') {
        expect(parsed.id).toBe('my-plugin');
        expect(parsed.code).toBe('console.log("hello");');
      }
    });

    it('applies default version for plugin_scaffold', () => {
      const payload = {
        type: 'plugin_scaffold',
        id: 'plugin-id',
        name: 'Plugin Name',
        code: 'const x = 1;',
      };
      const parsed = AiPayloadSchema.parse(payload);
      if (parsed.type === 'plugin_scaffold') {
        expect(parsed.version).toBe('0.1.0');
      }
    });

    it('applies default entry for plugin_scaffold', () => {
      const payload = {
        type: 'plugin_scaffold',
        id: 'plugin-id',
        name: 'Plugin Name',
        version: '1.0.0',
        code: 'const x = 1;',
      };
      const parsed = AiPayloadSchema.parse(payload);
      if (parsed.type === 'plugin_scaffold') {
        expect(parsed.entry).toBe('index.js');
      }
    });

    it('rejects plugin_scaffold without code field', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'plugin_scaffold',
        id: 'x',
        name: 'x',
        version: '1.0.0',
      })).toThrow();
    });

    it('rejects plugin_scaffold without id', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'plugin_scaffold',
        name: 'Plugin',
        version: '1.0.0',
        code: 'const x = 1;',
      })).toThrow();
    });

    it('rejects plugin_scaffold without name', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'plugin_scaffold',
        id: 'plugin',
        version: '1.0.0',
        code: 'const x = 1;',
      })).toThrow();
    });
  });

  describe('template_pack payload', () => {
    it('validates template_pack payload', () => {
      const payload = {
        type: 'template_pack',
        name: 'My Templates',
        templates: [
          { name: 'flowchart', content: '{"type":"excalidraw"}' },
          { name: 'mindmap', content: '{"elements":[]}' },
        ],
      };
      const parsed = AiPayloadSchema.parse(payload);
      expect(parsed.type).toBe('template_pack');
      if (parsed.type === 'template_pack') {
        expect(parsed.name).toBe('My Templates');
        expect(parsed.templates).toHaveLength(2);
        expect(parsed.templates[0].name).toBe('flowchart');
      }
    });

    it('validates template_pack with single template', () => {
      const payload = {
        type: 'template_pack',
        name: 'Single Template',
        templates: [
          { name: 'basic', content: '{}' },
        ],
      };
      const parsed = AiPayloadSchema.parse(payload);
      if (parsed.type === 'template_pack') {
        expect(parsed.templates).toHaveLength(1);
        expect(parsed.templates[0].content).toBe('{}');
      }
    });

    it('rejects template_pack without name', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'template_pack',
        templates: [{ name: 'x', content: '{}' }],
      })).toThrow();
    });

    it('rejects template_pack without templates array', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'template_pack',
        name: 'Templates',
      })).toThrow();
    });

    it('rejects template_pack with empty templates array', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'template_pack',
        name: 'Empty Pack',
        templates: [],
      })).toThrow();
    });

    it('rejects template with missing name', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'template_pack',
        name: 'Templates',
        templates: [
          { content: '{}' },
        ],
      })).toThrow();
    });

    it('rejects template with missing content', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'template_pack',
        name: 'Templates',
        templates: [
          { name: 'template1' },
        ],
      })).toThrow();
    });
  });

  describe('settings_bundle payload', () => {
    it('validates settings_bundle with full settings', () => {
      const payload = {
        type: 'settings_bundle',
        settings: {
          autosave: false,
          autosaveIntervalSeconds: 30,
          defaultExportFormat: 'svg',
          confirmOnDelete: false,
          showGrid: true,
        },
      };
      const parsed = AiPayloadSchema.parse(payload);
      expect(parsed.type).toBe('settings_bundle');
      if (parsed.type === 'settings_bundle') {
        expect(parsed.settings.autosave).toBe(false);
        expect(parsed.settings.showGrid).toBe(true);
      }
    });

    it('validates settings_bundle with partial settings', () => {
      const payload = {
        type: 'settings_bundle',
        settings: { autosave: true, theme: 'dark' },
      };
      const parsed = AiPayloadSchema.parse(payload);
      if (parsed.type === 'settings_bundle') {
        expect(parsed.settings.autosave).toBe(true);
        expect((parsed.settings as any).theme).toBe('dark');
      }
    });

    it('validates settings_bundle with empty settings object', () => {
      const payload = {
        type: 'settings_bundle',
        settings: {},
      };
      const parsed = AiPayloadSchema.parse(payload);
      expect(parsed.type).toBe('settings_bundle');
    });

    it('rejects settings_bundle without settings field', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'settings_bundle',
      })).toThrow();
    });

    it('rejects settings_bundle with non-object settings', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'settings_bundle',
        settings: 'not an object',
      })).toThrow();
    });
  });

  describe('docs_update payload', () => {
    it('validates docs_update payload', () => {
      const payload = {
        type: 'docs_update',
        filename: 'USER_GUIDE.md',
        content: '# User Guide\n\nThis is a guide.',
      };
      const parsed = AiPayloadSchema.parse(payload);
      expect(parsed.type).toBe('docs_update');
      if (parsed.type === 'docs_update') {
        expect(parsed.filename).toBe('USER_GUIDE.md');
        expect(parsed.content).toContain('User Guide');
      }
    });

    it('validates docs_update with simple filename', () => {
      const payload = {
        type: 'docs_update',
        filename: 'advanced-guide.md',
        content: '# Advanced Guide',
      };
      const parsed = AiPayloadSchema.parse(payload);
      if (parsed.type === 'docs_update') {
        expect(parsed.filename).toBe('advanced-guide.md');
      }
    });

    it('rejects docs_update with path separators in filename', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'docs_update',
        filename: 'docs/guides/advanced.md',
        content: '# Advanced Guide',
      })).toThrow();
    });

    it('rejects docs_update without filename', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'docs_update',
        content: '# Content',
      })).toThrow();
    });

    it('rejects docs_update without content', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'docs_update',
        filename: 'README.md',
      })).toThrow();
    });
  });

  describe('discriminated union behavior', () => {
    it('rejects unknown payload type', () => {
      expect(() => AiPayloadSchema.parse({
        type: 'unknown_type',
        data: {},
      })).toThrow();
    });

    it('rejects payload with type field of wrong type', () => {
      expect(() => AiPayloadSchema.parse({
        type: 123,
        data: {},
      })).toThrow();
    });

    it('correctly discriminates between types', () => {
      const payloads = [
        {
          type: 'plugin_scaffold' as const,
          id: 'p1',
          name: 'Plugin',
          version: '1.0.0',
          code: 'const x = 1;',
        },
        {
          type: 'template_pack' as const,
          name: 'Templates',
          templates: [{ name: 't1', content: '{}' }],
        },
        {
          type: 'settings_bundle' as const,
          settings: {},
        },
        {
          type: 'docs_update' as const,
          filename: 'README.md',
          content: '# Docs',
        },
      ];

      for (const payload of payloads) {
        const parsed = AiPayloadSchema.parse(payload);
        expect(parsed.type).toBe(payload.type);
      }
    });
  });
});

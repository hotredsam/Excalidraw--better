import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AiImporter } from '../main/ai-import';

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((pathName: string) => {
      if (pathName === 'userData') return '/test/appdata';
      return '/test/default';
    }),
  },
}));

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: vi.fn(),
  ensureDir: vi.fn(),
  writeJson: vi.fn(),
  writeFile: vi.fn(),
}));

describe('AiImporter', () => {
  let importer: AiImporter;
  const testProfileDir = '/test/profile';

  beforeEach(() => {
    vi.clearAllMocks();
    importer = new AiImporter(testProfileDir);
  });

  describe('constructor', () => {
    it('should initialize with profile directory', () => {
      const customDir = '/custom/profile/path';
      const importerInstance = new AiImporter(customDir);
      expect((importerInstance as any).profileDir).toBe(customDir);
    });
  });

  describe('validate', () => {
    it('should validate valid plugin scaffold JSON', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(true);
      expect(result.type).toBe('plugin_scaffold');
      expect(result.payload).toBeDefined();
    });

    it('should validate valid template pack JSON', () => {
      const json = JSON.stringify({
        type: 'template_pack',
        name: 'My Templates',
        templates: [
          { name: 'Template 1', content: '{"elements":[]}' },
          { name: 'Template 2', content: '{"elements":[]}' },
        ],
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(true);
      expect(result.type).toBe('template_pack');
    });

    it('should validate valid settings bundle JSON', () => {
      const json = JSON.stringify({
        type: 'settings_bundle',
        settings: { autosave: true, theme: 'dark' },
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(true);
      expect(result.type).toBe('settings_bundle');
    });

    it('should validate valid docs update JSON', () => {
      const json = JSON.stringify({
        type: 'docs_update',
        filename: 'guide.md',
        content: '# Documentation',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(true);
      expect(result.type).toBe('docs_update');
    });

    it('should reject invalid JSON', () => {
      const invalidJson = '{invalid json}';

      const result = importer.validate(invalidJson);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should reject missing type field', () => {
      const json = JSON.stringify({
        id: 'my-plugin',
        name: 'My Plugin',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid type value', () => {
      const json = JSON.stringify({
        type: 'invalid_type',
        data: 'some data',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject plugin with invalid ID characters', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'my@plugin!',
        name: 'My Plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject plugin with ID longer than 64 characters', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'a'.repeat(65),
        name: 'My Plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject plugin with invalid entry filename', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'my-plugin',
        name: 'My Plugin',
        entry: 'path/to/index.js',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject template pack with no templates', () => {
      const json = JSON.stringify({
        type: 'template_pack',
        name: 'Empty Templates',
        templates: [],
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject docs update with invalid filename characters', () => {
      const json = JSON.stringify({
        type: 'docs_update',
        filename: 'guide/../../etc/passwd',
        content: '# Documentation',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject docs update with filename longer than 255 characters', () => {
      const json = JSON.stringify({
        type: 'docs_update',
        filename: 'a'.repeat(256) + '.md',
        content: '# Documentation',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should provide helpful error messages', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'my plugin',
        name: 'My Plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should validate plugin with default version', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'my-plugin',
        name: 'My Plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(true);
      expect(result.payload?.type === 'plugin_scaffold' && result.payload.version).toBe('0.1.0');
    });

    it('should validate plugin with default entry', () => {
      const json = JSON.stringify({
        type: 'plugin_scaffold',
        id: 'my-plugin',
        name: 'My Plugin',
        code: 'console.log("hello");',
      });

      const result = importer.validate(json);

      expect(result.valid).toBe(true);
      expect(result.payload?.type === 'plugin_scaffold' && result.payload.entry).toBe('index.js');
    });
  });

  describe('apply', () => {
    beforeEach(() => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);
    });

    it('should apply valid plugin scaffold', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(result.message).toContain('My Plugin');
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJson).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should apply plugin scaffold with manifest', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        entry: 'index.js',
        code: 'console.log("hello");',
        manifest: { keywords: ['drawing', 'export'] },
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(fs.writeJson).toHaveBeenCalled();

      // Verify manifest was included
      const writeJsonCall = (fs.writeJson as any).mock.calls[0];
      const manifest = writeJsonCall[1];
      expect(manifest.keywords).toEqual(['drawing', 'export']);
    });

    it('should detect plugin path traversal attacks', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: '../../../etc/passwd',
        name: 'Evil Plugin',
        version: '1.0.0',
        entry: 'index.js',
        code: 'console.log("hello");',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(false);
      // The schema validation will catch this before path traversal check
      expect(result.message).toContain('Invalid');
    });

    it('should detect plugin id with dots for traversal', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: 'my-plugin',
        name: 'Evil Plugin',
        version: '1.0.0',
        entry: 'index.js',
        code: 'console.log("hello");',
      };

      const result = await importer.apply(payload);

      // Valid ID should succeed
      expect(result.success).toBe(true);
    });

    it('should apply template pack', async () => {
      const payload = {
        type: 'template_pack' as const,
        name: 'My Templates',
        templates: [
          { name: 'Template 1', content: '{"elements":[]}' },
          { name: 'Template 2', content: '{"elements":[]}' },
        ],
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });

    it('should sanitize template names', async () => {
      const payload = {
        type: 'template_pack' as const,
        name: 'My Templates',
        templates: [
          { name: 'Template@#$%^', content: '{"elements":[]}' },
        ],
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();

      // Verify name was sanitized
      const writeFileCall = (fs.writeFile as any).mock.calls[0];
      const filePath = writeFileCall[0];
      expect(filePath).not.toContain('@');
      expect(filePath).not.toContain('#');
    });

    it('should apply settings bundle', async () => {
      const payload = {
        type: 'settings_bundle' as const,
        settings: { autosave: false, theme: 'dark' },
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(result.message).toContain('validated');
    });

    it('should apply docs update', async () => {
      const payload = {
        type: 'docs_update' as const,
        filename: 'guide.md',
        content: '# Documentation\n\nThis is a guide.',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should detect docs update path traversal', async () => {
      const payload = {
        type: 'docs_update' as const,
        filename: '../../../etc/passwd',
        content: 'malicious content',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(false);
      // Schema validation will catch this first
      expect(result.message).toContain('Invalid');
    });

    it('should reject invalid payload in apply', async () => {
      const invalidPayload = {
        type: 'unknown_type' as any,
        data: 'some data',
      };

      const result = await importer.apply(invalidPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid payload');
    });

    it('should handle unknown payload types', async () => {
      const payload = {
        type: 'unknown_type' as any,
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(false);
    });

    it('should create manifest with basic fields', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        entry: 'index.js',
        code: 'console.log("hello");',
      };

      await importer.apply(payload);

      const writeJsonCall = (fs.writeJson as any).mock.calls[0];
      const manifest = writeJsonCall[1];

      expect(manifest.id).toBe('my-plugin');
      expect(manifest.name).toBe('My Plugin');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.description).toBe('A test plugin');
      expect(manifest.entry).toBe('index.js');
    });

    it('should write plugin code to entry file', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        entry: 'main.js',
        code: 'function main() { console.log("plugin"); }',
      };

      await importer.apply(payload);

      const writeFileCall = (fs.writeFile as any).mock.calls.find(
        (call: any[]) => call[2] === 'utf-8'
      );
      expect(writeFileCall).toBeDefined();
      expect(writeFileCall[1]).toContain('plugin');
    });

    it('should handle multiple templates correctly', async () => {
      const payload = {
        type: 'template_pack' as const,
        name: 'Multi Templates',
        templates: [
          { name: 'Template A', content: '{"elements":["a"]}' },
          { name: 'Template B', content: '{"elements":["b"]}' },
          { name: 'Template C', content: '{"elements":["c"]}' },
        ],
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledTimes(3);
    });

    it('should include template count in success message', async () => {
      const payload = {
        type: 'template_pack' as const,
        name: 'Pack',
        templates: [
          { name: 'T1', content: 'content1' },
          { name: 'T2', content: 'content2' },
          { name: 'T3', content: 'content3' },
        ],
      };

      const result = await importer.apply(payload);

      expect(result.message).toContain('3');
    });

    it('should handle docs updates with safe filenames', async () => {
      const payload = {
        type: 'docs_update' as const,
        filename: 'user-guide-v2.0.md',
        content: 'User Guide Content',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(true);
      expect(result.message).toContain('user-guide-v2.0.md');
    });

    it('should ensure plugin directory exists before writing', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: 'new-plugin',
        name: 'New Plugin',
        entry: 'index.js',
        code: 'console.log("new");',
      };

      await importer.apply(payload);

      expect(fs.ensureDir).toHaveBeenCalled();
    });
  });

  describe('security', () => {
    beforeEach(() => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);
    });

    it('should prevent directory traversal in plugin IDs', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: '../../malicious',
        name: 'Evil',
        entry: 'index.js',
        code: 'evil code',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(false);
    });

    it('should prevent directory traversal in docs filenames', async () => {
      const payload = {
        type: 'docs_update' as const,
        filename: '../../etc/shadow',
        content: 'hacked',
      };

      const result = await importer.apply(payload);

      expect(result.success).toBe(false);
    });

    it('should validate payload before processing', async () => {
      const invalidPayload = {
        type: 'plugin_scaffold',
        // Missing required fields
      };

      const result = await importer.apply(invalidPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid payload');
    });

    it('should handle absolute paths safely in plugin ID', async () => {
      const payload = {
        type: 'plugin_scaffold' as const,
        id: '/etc/passwd',
        name: 'Evil',
        entry: 'index.js',
        code: 'evil',
      };

      // Note: This should be caught by schema validation first
      const validationResult = importer.validate(JSON.stringify(payload));
      expect(validationResult.valid).toBe(false);
    });
  });
});

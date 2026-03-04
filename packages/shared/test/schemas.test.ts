import { describe, it, expect } from 'vitest';
import {
  ProfileSchema,
  SettingsSchema,
  WorkspaceSchema,
  FileInfoSchema,
  ExcalidrawFileSchema,
  mergeExcalidraw,
} from '../src/index';

describe('ProfileSchema', () => {
  it('accepts valid profile', () => {
    const profile = {
      id: 'abc123',
      name: 'Test User',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
    };
    expect(() => ProfileSchema.parse(profile)).not.toThrow();
  });

  it('rejects profile without id', () => {
    expect(() => ProfileSchema.parse({ name: 'x', createdAt: 0, updatedAt: 0, lastOpenedAt: 0 })).toThrow();
  });

  it('rejects profile without name', () => {
    expect(() => ProfileSchema.parse({ id: 'x', createdAt: 0, updatedAt: 0, lastOpenedAt: 0 })).toThrow();
  });

  it('rejects profile with non-numeric createdAt', () => {
    expect(() => ProfileSchema.parse({ id: 'x', name: 'x', createdAt: 'not-a-number', updatedAt: 0, lastOpenedAt: 0 })).toThrow();
  });

  it('parses valid profile with correct types', () => {
    const profile = {
      id: 'user1',
      name: 'John Doe',
      createdAt: 1000,
      updatedAt: 2000,
      lastOpenedAt: 3000,
    };
    const parsed = ProfileSchema.parse(profile);
    expect(parsed.id).toBe('user1');
    expect(parsed.name).toBe('John Doe');
    expect(parsed.createdAt).toBe(1000);
  });
});

describe('SettingsSchema', () => {
  it('applies defaults for empty object', () => {
    const settings = SettingsSchema.parse({});
    expect(settings.autosave).toBe(true);
    expect(settings.autosaveIntervalSeconds).toBe(15);
    expect(settings.defaultExportFormat).toBe('png');
    expect(settings.confirmOnDelete).toBe(true);
    expect(settings.showGrid).toBe(false);
  });

  it('accepts valid settings', () => {
    const settings = SettingsSchema.parse({
      autosave: false,
      autosaveIntervalSeconds: 30,
      defaultExportFormat: 'svg',
      confirmOnDelete: false,
      showGrid: true,
    });
    expect(settings.defaultExportFormat).toBe('svg');
    expect(settings.autosave).toBe(false);
    expect(settings.showGrid).toBe(true);
  });

  it('rejects invalid export format', () => {
    expect(() => SettingsSchema.parse({ defaultExportFormat: 'pdf' })).toThrow();
  });

  it('accepts only allowed export formats', () => {
    const pngSettings = SettingsSchema.parse({ defaultExportFormat: 'png' });
    expect(pngSettings.defaultExportFormat).toBe('png');

    const svgSettings = SettingsSchema.parse({ defaultExportFormat: 'svg' });
    expect(svgSettings.defaultExportFormat).toBe('svg');
  });

  it('rejects invalid autosaveIntervalSeconds type', () => {
    expect(() => SettingsSchema.parse({ autosaveIntervalSeconds: 'thirty' })).toThrow();
  });

  it('merges partial settings with defaults', () => {
    const settings = SettingsSchema.parse({ autosave: false });
    expect(settings.autosave).toBe(false);
    expect(settings.defaultExportFormat).toBe('png'); // default
  });
});

describe('WorkspaceSchema', () => {
  it('accepts valid workspace', () => {
    const ws = { id: 'ws1', name: 'My Workspace', path: '/home/user/drawings', lastOpenedAt: 0 };
    expect(() => WorkspaceSchema.parse(ws)).not.toThrow();
  });

  it('rejects workspace without path', () => {
    expect(() => WorkspaceSchema.parse({ id: 'ws1', name: 'x', lastOpenedAt: 0 })).toThrow();
  });

  it('rejects workspace without id', () => {
    expect(() => WorkspaceSchema.parse({ name: 'x', path: '/some/path', lastOpenedAt: 0 })).toThrow();
  });

  it('rejects workspace without name', () => {
    expect(() => WorkspaceSchema.parse({ id: 'ws1', path: '/some/path', lastOpenedAt: 0 })).toThrow();
  });

  it('parses valid workspace with correct fields', () => {
    const ws = WorkspaceSchema.parse({
      id: 'workspace123',
      name: 'Project Alpha',
      path: '/home/user/projects/alpha',
      lastOpenedAt: 1234567890,
    });
    expect(ws.id).toBe('workspace123');
    expect(ws.name).toBe('Project Alpha');
    expect(ws.path).toBe('/home/user/projects/alpha');
  });
});

describe('FileInfoSchema', () => {
  it('accepts valid file info', () => {
    const file = {
      name: 'drawing.excalidraw',
      path: '/home/user/drawing.excalidraw',
      isDirectory: false,
      size: 1024,
      mtime: Date.now(),
    };
    expect(() => FileInfoSchema.parse(file)).not.toThrow();
  });

  it('accepts file info with extension', () => {
    const file = {
      name: 'drawing.excalidraw',
      path: '/home/user/drawing.excalidraw',
      isDirectory: false,
      size: 1024,
      mtime: Date.now(),
      extension: '.excalidraw',
    };
    const parsed = FileInfoSchema.parse(file);
    expect(parsed.extension).toBe('.excalidraw');
  });

  it('rejects file info without name', () => {
    expect(() => FileInfoSchema.parse({
      path: '/home/user/file',
      isDirectory: false,
      size: 100,
      mtime: 0,
    })).toThrow();
  });

  it('accepts directory info', () => {
    const dir = {
      name: 'my-folder',
      path: '/home/user/my-folder',
      isDirectory: true,
      size: 4096,
      mtime: Date.now(),
    };
    const parsed = FileInfoSchema.parse(dir);
    expect(parsed.isDirectory).toBe(true);
  });
});

describe('ExcalidrawFileSchema', () => {
  it('applies defaults for minimal file', () => {
    const file = ExcalidrawFileSchema.parse({});
    expect(file.type).toBe('excalidraw');
    expect(file.version).toBe(2);
    expect(file.elements).toEqual([]);
    expect(file.source).toBe('https://excalidraw.com');
  });

  it('passes through extra fields', () => {
    const file = ExcalidrawFileSchema.parse({ type: 'excalidraw', customField: 'hello' });
    expect((file as any).customField).toBe('hello');
  });

  it('accepts custom type override', () => {
    const file = ExcalidrawFileSchema.parse({ type: 'custom-type' });
    expect(file.type).toBe('custom-type');
  });

  it('accepts custom source', () => {
    const file = ExcalidrawFileSchema.parse({ source: 'https://custom.host' });
    expect(file.source).toBe('https://custom.host');
  });

  it('parses elements array', () => {
    const file = ExcalidrawFileSchema.parse({
      elements: [
        { id: '1', type: 'rectangle', x: 0, y: 0, width: 100, height: 50 },
        { id: '2', type: 'text', x: 10, y: 10, text: 'Hello' },
      ],
    });
    expect(file.elements).toHaveLength(2);
    expect((file.elements[0] as any).id).toBe('1');
  });

  it('parses appState object', () => {
    const file = ExcalidrawFileSchema.parse({
      appState: { viewBackgroundColor: '#ffffff', theme: 'light' },
    });
    expect((file.appState as any).viewBackgroundColor).toBe('#ffffff');
    expect((file.appState as any).theme).toBe('light');
  });

  it('parses files object', () => {
    const file = ExcalidrawFileSchema.parse({
      files: { 'img1': { id: 'img1', src: 'data:image/png;base64,...' } },
    });
    expect((file.files as any)['img1']).toBeDefined();
  });

  it('allows version override', () => {
    const file = ExcalidrawFileSchema.parse({ version: 3 });
    expect(file.version).toBe(3);
  });
});

describe('mergeExcalidraw', () => {
  it('merges new elements into existing file', () => {
    const existing = ExcalidrawFileSchema.parse({ type: 'excalidraw', elements: [{ id: 'old' }] });
    const merged = mergeExcalidraw(existing, [{ id: 'new1' }, { id: 'new2' }], {});
    expect(merged.elements).toHaveLength(2);
    expect((merged.elements[0] as any).id).toBe('new1');
  });

  it('replaces elements completely', () => {
    const existing = ExcalidrawFileSchema.parse({
      elements: [{ id: 'old1' }, { id: 'old2' }],
    });
    const merged = mergeExcalidraw(existing, [{ id: 'new' }], {});
    expect(merged.elements).toHaveLength(1);
    expect((merged.elements[0] as any).id).toBe('new');
  });

  it('merges appState preserving existing keys', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: { viewBackgroundColor: '#fff', theme: 'dark' },
    });
    const merged = mergeExcalidraw(existing, [], { zoom: 1.5 });
    expect((merged.appState as any).theme).toBe('dark');
    expect((merged.appState as any).zoom).toBe(1.5);
    expect((merged.appState as any).viewBackgroundColor).toBe('#fff');
  });

  it('allows appState overrides', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: { theme: 'light', gridMode: true },
    });
    const merged = mergeExcalidraw(existing, [], { theme: 'dark' });
    expect((merged.appState as any).theme).toBe('dark');
    expect((merged.appState as any).gridMode).toBe(true);
  });

  it('preserves extra fields from existing file', () => {
    const existing = ExcalidrawFileSchema.parse({ source: 'https://custom.host' });
    const merged = mergeExcalidraw(existing, [], {});
    expect(merged.source).toBe('https://custom.host');
  });

  it('preserves custom fields added via passthrough', () => {
    const existing = ExcalidrawFileSchema.parse({
      customField: 'custom-value',
      nested: { key: 'value' },
    });
    const merged = mergeExcalidraw(existing, [], {});
    expect((merged as any).customField).toBe('custom-value');
    expect((merged as any).nested.key).toBe('value');
  });

  it('handles empty merge operations', () => {
    const existing = ExcalidrawFileSchema.parse({
      elements: [{ id: '1' }],
      appState: { theme: 'light' },
      source: 'https://excalidraw.com',
    });
    // mergeExcalidraw replaces elements with new data; appState is merged; extra fields preserved
    const merged = mergeExcalidraw(existing, [], {});
    expect(merged.elements).toHaveLength(0);
    expect((merged.appState as any).theme).toBe('light');
    expect(merged.source).toBe('https://excalidraw.com');
  });

  it('validates merged result against schema', () => {
    const existing = ExcalidrawFileSchema.parse({});
    const merged = mergeExcalidraw(existing, [{ id: 'elem1' }], { zoom: 2 });
    // If validation fails, parse would throw
    expect(merged.elements).toHaveLength(1);
    expect((merged.appState as any).zoom).toBe(2);
  });
});

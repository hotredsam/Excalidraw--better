import { describe, it, expect } from 'vitest';
import {
  ProfileSchema,
  SettingsSchema,
  WorkspaceSchema,
  FileInfoSchema,
  ExcalidrawFileSchema,
  mergeExcalidraw,
} from '../src/index';

describe('ProfileSchema edge cases', () => {
  it('accepts profile with empty string name', () => {
    const profile = {
      id: 'user1',
      name: '',
      createdAt: 1000,
      updatedAt: 2000,
      lastOpenedAt: 3000,
    };
    const parsed = ProfileSchema.parse(profile);
    expect(parsed.name).toBe('');
  });

  it('accepts profile with zero timestamps', () => {
    const profile = {
      id: 'user1',
      name: 'User One',
      createdAt: 0,
      updatedAt: 0,
      lastOpenedAt: 0,
    };
    const parsed = ProfileSchema.parse(profile);
    expect(parsed.createdAt).toBe(0);
    expect(parsed.updatedAt).toBe(0);
    expect(parsed.lastOpenedAt).toBe(0);
  });

  it('accepts profile with very large timestamp numbers', () => {
    const largeTimestamp = Number.MAX_SAFE_INTEGER;
    const profile = {
      id: 'user1',
      name: 'User One',
      createdAt: largeTimestamp,
      updatedAt: largeTimestamp,
      lastOpenedAt: largeTimestamp,
    };
    const parsed = ProfileSchema.parse(profile);
    expect(parsed.createdAt).toBe(largeTimestamp);
  });
});

describe('SettingsSchema edge cases', () => {
  it('accepts negative autosaveIntervalSeconds', () => {
    const settings = SettingsSchema.parse({
      autosaveIntervalSeconds: -100,
    });
    expect(settings.autosaveIntervalSeconds).toBe(-100);
  });

  it('accepts zero autosaveIntervalSeconds', () => {
    const settings = SettingsSchema.parse({
      autosaveIntervalSeconds: 0,
    });
    expect(settings.autosaveIntervalSeconds).toBe(0);
  });

  it('accepts very large autosaveIntervalSeconds', () => {
    const settings = SettingsSchema.parse({
      autosaveIntervalSeconds: 999999999,
    });
    expect(settings.autosaveIntervalSeconds).toBe(999999999);
  });

  it('accepts all default values for empty object', () => {
    const settings = SettingsSchema.parse({});
    expect(settings.autosave).toBe(true);
    expect(settings.autosaveIntervalSeconds).toBe(15);
    expect(settings.defaultExportFormat).toBe('png');
    expect(settings.confirmOnDelete).toBe(true);
    expect(settings.showGrid).toBe(false);
  });
});

describe('WorkspaceSchema edge cases', () => {
  it('accepts workspace with special characters in path', () => {
    const ws = {
      id: 'ws1',
      name: 'Special Workspace',
      path: '/home/user/path-with-special!@#$%^&*()_chars',
      lastOpenedAt: 1000,
    };
    const parsed = WorkspaceSchema.parse(ws);
    expect(parsed.path).toContain('special!@#$%^&*()_chars');
  });

  it('accepts workspace with unicode characters in path', () => {
    const ws = {
      id: 'ws1',
      name: 'Unicode Workspace',
      path: '/home/user/路径/unicode',
      lastOpenedAt: 1000,
    };
    const parsed = WorkspaceSchema.parse(ws);
    expect(parsed.path).toContain('路径');
  });

  it('accepts workspace with empty string name', () => {
    const ws = {
      id: 'ws1',
      name: '',
      path: '/home/user/workspace',
      lastOpenedAt: 1000,
    };
    const parsed = WorkspaceSchema.parse(ws);
    expect(parsed.name).toBe('');
  });

  it('accepts workspace with very long path', () => {
    const longPath = '/home/user/' + 'a'.repeat(500);
    const ws = {
      id: 'ws1',
      name: 'Long Path Workspace',
      path: longPath,
      lastOpenedAt: 1000,
    };
    const parsed = WorkspaceSchema.parse(ws);
    expect(parsed.path.length).toBeGreaterThan(500);
  });
});

describe('FileInfoSchema edge cases', () => {
  it('accepts file with zero size', () => {
    const file = {
      name: 'empty.txt',
      path: '/home/user/empty.txt',
      isDirectory: false,
      size: 0,
      mtime: 1000,
    };
    const parsed = FileInfoSchema.parse(file);
    expect(parsed.size).toBe(0);
  });

  it('accepts file with undefined extension', () => {
    const file = {
      name: 'file',
      path: '/home/user/file',
      isDirectory: false,
      size: 100,
      mtime: 1000,
      extension: undefined,
    };
    const parsed = FileInfoSchema.parse(file);
    expect(parsed.extension).toBeUndefined();
  });

  it('accepts file without extension field', () => {
    const file = {
      name: 'file-no-ext',
      path: '/home/user/file-no-ext',
      isDirectory: false,
      size: 100,
      mtime: 1000,
    };
    const parsed = FileInfoSchema.parse(file);
    expect(parsed.extension).toBeUndefined();
  });

  it('accepts file with very large size', () => {
    const file = {
      name: 'large.bin',
      path: '/home/user/large.bin',
      isDirectory: false,
      size: Number.MAX_SAFE_INTEGER,
      mtime: 1000,
    };
    const parsed = FileInfoSchema.parse(file);
    expect(parsed.size).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('accepts directory with empty string name', () => {
    const dir = {
      name: '',
      path: '/home/user/',
      isDirectory: true,
      size: 4096,
      mtime: 1000,
    };
    const parsed = FileInfoSchema.parse(dir);
    expect(parsed.isDirectory).toBe(true);
  });
});

describe('ExcalidrawFileSchema edge cases', () => {
  it('accepts empty appState object', () => {
    const file = ExcalidrawFileSchema.parse({
      appState: {},
    });
    expect(file.appState).toEqual({});
  });

  it('accepts appState with various data types', () => {
    const file = ExcalidrawFileSchema.parse({
      appState: {
        stringValue: 'hello',
        numberValue: 42,
        booleanValue: true,
        nullValue: null,
        arrayValue: [1, 2, 3],
        objectValue: { nested: 'value' },
      },
    });
    expect((file.appState as any).stringValue).toBe('hello');
    expect((file.appState as any).numberValue).toBe(42);
  });

  it('accepts nested elements array', () => {
    const file = ExcalidrawFileSchema.parse({
      elements: [
        {
          id: '1',
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          children: [{ id: 'child1' }, { id: 'child2' }],
        },
      ],
    });
    expect(file.elements).toHaveLength(1);
    expect((file.elements[0] as any).children).toHaveLength(2);
  });

  it('accepts large elements array', () => {
    const elements = Array.from({ length: 1000 }, (_, i) => ({
      id: `elem-${i}`,
      type: 'rectangle',
      x: i * 10,
      y: i * 10,
    }));
    const file = ExcalidrawFileSchema.parse({
      elements,
    });
    expect(file.elements).toHaveLength(1000);
  });

  it('accepts deeply nested appState', () => {
    const file = ExcalidrawFileSchema.parse({
      appState: {
        level1: {
          level2: {
            level3: {
              level4: {
                deep: 'value',
              },
            },
          },
        },
      },
    });
    expect((file.appState as any).level1.level2.level3.level4.deep).toBe('value');
  });

  it('accepts files object with complex structure', () => {
    const file = ExcalidrawFileSchema.parse({
      files: {
        'img-1': {
          id: 'img-1',
          src: 'data:image/png;base64,...',
          width: 800,
          height: 600,
        },
        'img-2': {
          id: 'img-2',
          src: 'data:image/jpeg;base64,...',
        },
      },
    });
    expect(Object.keys((file.files as any))).toHaveLength(2);
  });

  it('accepts custom fields via passthrough', () => {
    const file = ExcalidrawFileSchema.parse({
      type: 'excalidraw',
      customProp1: 'value1',
      customProp2: { nested: 'data' },
      customProp3: [1, 2, 3],
    });
    expect((file as any).customProp1).toBe('value1');
    expect((file as any).customProp2.nested).toBe('data');
  });
});

describe('mergeExcalidraw edge cases', () => {
  it('merges with large elements array', () => {
    const existing = ExcalidrawFileSchema.parse({});
    const largeElements = Array.from({ length: 500 }, (_, i) => ({
      id: `elem-${i}`,
    }));
    const merged = mergeExcalidraw(existing, largeElements, {});
    expect(merged.elements).toHaveLength(500);
  });

  it('appState keys do not clobber if not in new data', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: {
        keepMe: 'original',
        updateMe: 'will be replaced',
        deleteMe: 'should stay',
      },
    });
    const merged = mergeExcalidraw(existing, [], { updateMe: 'new value' });
    expect((merged.appState as any).keepMe).toBe('original');
    expect((merged.appState as any).updateMe).toBe('new value');
    expect((merged.appState as any).deleteMe).toBe('should stay');
  });

  it('empty new appState keeps old appState', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: { theme: 'dark', zoom: 1.5 },
    });
    const merged = mergeExcalidraw(existing, [], {});
    expect((merged.appState as any).theme).toBe('dark');
    expect((merged.appState as any).zoom).toBe(1.5);
  });

  it('null appState values in new data are preserved', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: { key1: 'value1', key2: 'value2' },
    });
    const merged = mergeExcalidraw(existing, [], { key2: null });
    expect((merged.appState as any).key1).toBe('value1');
    expect((merged.appState as any).key2).toBeNull();
  });

  it('undefined appState values in new data are treated as keys', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: { key1: 'value1' },
    });
    const merged = mergeExcalidraw(existing, [], { key2: undefined });
    expect((merged.appState as any).key1).toBe('value1');
    expect((merged.appState as any).key2).toBeUndefined();
  });

  it('returned object is a new object (immutability)', () => {
    const existing = ExcalidrawFileSchema.parse({
      elements: [{ id: 'old' }],
      appState: { theme: 'light' },
    });
    const merged = mergeExcalidraw(existing, [{ id: 'new' }], {});
    expect(merged).not.toBe(existing);
    expect(merged.elements).not.toBe(existing.elements);
    expect((merged.appState as any)).not.toBe((existing.appState as any));
  });

  it('preserves all extra fields during merge', () => {
    const existing = ExcalidrawFileSchema.parse({
      type: 'excalidraw',
      version: 3,
      source: 'https://custom.host',
      extra1: 'value1',
      extra2: { nested: 'data' },
    });
    const merged = mergeExcalidraw(existing, [{ id: 'new' }], {});
    expect(merged.type).toBe('excalidraw');
    expect(merged.version).toBe(3);
    expect(merged.source).toBe('https://custom.host');
    expect((merged as any).extra1).toBe('value1');
    expect((merged as any).extra2.nested).toBe('data');
  });

  it('replaces elements completely without merging', () => {
    const existing = ExcalidrawFileSchema.parse({
      elements: [{ id: '1' }, { id: '2' }, { id: '3' }],
    });
    const merged = mergeExcalidraw(existing, [{ id: 'new1' }], {});
    expect(merged.elements).toHaveLength(1);
    expect((merged.elements[0] as any).id).toBe('new1');
  });

  it('handles appState merge with complex nested objects', () => {
    const existing = ExcalidrawFileSchema.parse({
      appState: {
        ui: { theme: 'dark', sidebar: true },
        viewport: { zoom: 1.5, pan: { x: 0, y: 0 } },
      },
    });
    const merged = mergeExcalidraw(existing, [], {
      ui: { theme: 'light' },
      viewport: { zoom: 2 },
    });
    // Note: mergeExcalidraw does shallow merge, so nested objects are replaced
    expect((merged.appState as any).ui).toEqual({ theme: 'light' });
    expect((merged.appState as any).viewport).toEqual({ zoom: 2 });
  });

  it('validates merged result through schema', () => {
    const existing = ExcalidrawFileSchema.parse({});
    // This should not throw because mergeExcalidraw calls parse
    const merged = mergeExcalidraw(existing, [], {});
    expect(merged.type).toBe('excalidraw');
    expect(merged.version).toBe(2);
  });
});

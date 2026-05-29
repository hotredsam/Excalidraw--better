/**
 * In-memory fake of the `window.api` preload bridge for renderer component
 * tests. Each builder returns a fresh, mutable backend so tests are isolated.
 */
import { vi } from 'vitest';

export interface FakeState {
  profiles: any[];
  activeProfileId: string | null;
  settings: any;
  workspaces: any[];
  activeWorkspaceId: string | null;
  files: any[];
  recents: any[];
  libraries: any[];
  snippets: Record<string, any>;
  templates: Record<string, any>;
  plugins: any[];
  shortcuts: any[];
  commands: any[];
  tags: Record<string, string[]>;
}

export function makeFakeApi(overrides: Partial<FakeState> = {}) {
  const state: FakeState = {
    profiles: [{ id: 'p1', name: 'Default', createdAt: 1, updatedAt: 1, lastOpenedAt: 1 }],
    activeProfileId: 'p1',
    settings: {
      autosave: true,
      autosaveIntervalSeconds: 15,
      showGrid: false,
      theme: 'dark',
      defaultExportFormat: 'png',
      confirmOnDelete: true,
      recentsLimit: 20,
      keepBackups: true,
      backupsToKeep: 10,
      autoOpenLastWorkspace: true,
      indexEmbeddedText: true,
    },
    workspaces: [{ id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 }],
    activeWorkspaceId: 'w1',
    files: [],
    recents: [],
    libraries: [],
    snippets: {},
    templates: {},
    plugins: [],
    shortcuts: [],
    commands: [
      { id: 'core.save', title: 'Save', category: 'File', accelerator: 'Ctrl+S', source: 'core' },
      { id: 'core.export', title: 'Export…', category: 'File', accelerator: 'Ctrl+P', source: 'core' },
      { id: 'core.new', title: 'New Drawing', category: 'File', accelerator: 'Ctrl+N', source: 'core' },
    ],
    tags: {},
    ...overrides,
  };

  const ok = { success: true };
  const api = {
    app: { ping: vi.fn(async () => ({ ok: true, version: '0.1.0', platform: 'test' })) },
    profiles: {
      list: vi.fn(async () => ({ profiles: state.profiles })),
      getActive: vi.fn(async () => state.profiles.find((p) => p.id === state.activeProfileId) || null),
      setActive: vi.fn(async (id: string) => ((state.activeProfileId = id), ok)),
      create: vi.fn(async (name: string) => {
        const p = { id: 'p' + (state.profiles.length + 1), name, createdAt: 1, updatedAt: 1, lastOpenedAt: 1 };
        state.profiles.push(p);
        return p;
      }),
      rename: vi.fn(async (id: string, name: string) => {
        const p = state.profiles.find((x) => x.id === id);
        if (p) p.name = name;
        return p;
      }),
      delete: vi.fn(async (id: string) => ((state.profiles = state.profiles.filter((p) => p.id !== id)), ok)),
    },
    settings: {
      get: vi.fn(async () => state.settings),
      update: vi.fn(async (partial: any) => ((state.settings = { ...state.settings, ...partial }), state.settings)),
    },
    workspaces: {
      list: vi.fn(async () => ({ workspaces: state.workspaces })),
      add: vi.fn(async () => state.workspaces[0]),
      remove: vi.fn(async () => ok),
      setActive: vi.fn(async (id: string) => ((state.activeWorkspaceId = id), ok)),
      getActive: vi.fn(async () => state.workspaces.find((w) => w.id === state.activeWorkspaceId) || null),
      listFiles: vi.fn(async () => state.files),
      readFile: vi.fn(async () => '{}'),
      readExcalidrawFile: vi.fn(async () => ({ type: 'excalidraw', version: 2, elements: [], appState: {}, files: {} })),
      writeFile: vi.fn(async () => ok),
      writeBinaryFile: vi.fn(async () => ok),
      deleteFile: vi.fn(async () => ok),
      renameFile: vi.fn(async (_w: string, p: string) => ({ path: p })),
      moveFile: vi.fn(async (_w: string, p: string) => ({ path: p })),
      copyFile: vi.fn(async (_w: string, p: string) => ({ path: p + ' copy' })),
      createFile: vi.fn(async (_w: string, _d: any, name: string) => ({ path: `/vault/${name}.excalidraw` })),
      createFolder: vi.fn(async (_w: string, _d: any, name: string) => ({ path: `/vault/${name}` })),
      search: vi.fn(async (_w: string, q: string) => ({
        results: state.files
          .filter((f) => f.name.includes(q))
          .map((f) => ({ name: f.name, path: f.path, extension: f.extension, mtime: 0, tags: [], matchedOn: ['name'] })),
        indexed: state.files.length,
      })),
      getTags: vi.fn(async () => state.tags),
      setTags: vi.fn(async (_w: string, p: string, tags: string[]) => ((state.tags[p] = tags), state.tags)),
      exportFile: vi.fn(async (_w: string, p: string) => ({ success: true, path: p })),
    },
    plugins: {
      list: vi.fn(async () => ({ plugins: state.plugins })),
      getContributions: vi.fn(async () => ({ toolbar: [], commands: [], panels: [], exportPresets: [], sourcePluginIds: {} })),
      installFromFolder: vi.fn(async () => null),
      enable: vi.fn(async () => ok),
      disable: vi.fn(async () => ok),
      uninstall: vi.fn(async () => ok),
    },
    ai: {
      validate: vi.fn(async (raw: string) => {
        try {
          const obj = JSON.parse(raw);
          if (obj.type === 'settings_bundle') return { ok: true, type: 'settings_bundle', payload: obj, summary: ['Settings bundle'], errors: [] };
          return { ok: false, summary: [], errors: ['Unknown type'] };
        } catch {
          return { ok: false, summary: [], errors: ['Bad JSON'] };
        }
      }),
      apply: vi.fn(async () => ({ ok: true, type: 'settings_bundle', message: 'applied', changes: [] })),
    },
    templates: {
      list: vi.fn(async () => ({ templates: Object.values(state.templates) })),
      apply: vi.fn(async (id: string) => state.templates[id]),
      save: vi.fn(async (input: any) => {
        const t = { id: input.title, title: input.title, description: '', tags: [] };
        state.templates[t.id] = { ...t, scene: input.scene };
        return t;
      }),
    },
    recents: {
      list: vi.fn(async () => ({ recents: state.recents })),
      add: vi.fn(async (entry: any) => ((state.recents = [entry, ...state.recents]), { recents: state.recents })),
      remove: vi.fn(async () => ({ recents: state.recents })),
      clear: vi.fn(async () => ((state.recents = []), ok)),
    },
    libraries: {
      list: vi.fn(async () => ({ libraries: state.libraries })),
      get: vi.fn(async () => ({ type: 'excalidrawlib', version: 2, libraryItems: [] })),
      import: vi.fn(async () => null),
      addItems: vi.fn(async () => ({ id: 'l1', name: 'l1', itemCount: 1, updatedAt: 1 })),
      remove: vi.fn(async () => ok),
      export: vi.fn(async () => ({ json: '{}' })),
    },
    bulk: {
      rename: vi.fn(async () => ({ ok: true, processed: 0, failed: 0, details: [] })),
      delete: vi.fn(async () => ({ ok: true, processed: 0, failed: 0, details: [] })),
      move: vi.fn(async () => ({ ok: true, processed: 0, failed: 0, details: [] })),
    },
    presentation: {
      getDeck: vi.fn(async () => ({ slides: [] })),
      setNotes: vi.fn(async () => ok),
    },
    review: {
      get: vi.fn(async () => ({ pins: [] })),
      addPin: vi.fn(async () => ({ pins: [{ id: 'pin1', x: 0, y: 0, resolved: false, comments: [{ id: 'c1', author: 'You', body: 'hi', createdAt: 1 }] }] })),
      addComment: vi.fn(async () => ({ pins: [] })),
      setResolved: vi.fn(async () => ({ pins: [] })),
      deletePin: vi.fn(async () => ({ pins: [] })),
    },
    stats: {
      compute: vi.fn(async () => ({
        totalFiles: 3,
        byExtension: { '.excalidraw': 3 },
        totalBytes: 1024,
        totalElements: 10,
        tagHistogram: { x: 2 },
        largestFiles: [{ name: 'a', path: '/a', size: 500 }],
        recentlyModified: [],
      })),
    },
    git: {
      status: vi.fn(async () => ({ isRepo: false, ahead: 0, behind: 0, files: [], clean: true })),
      commit: vi.fn(async () => ({ output: 'ok' })),
      log: vi.fn(async () => ({ entries: [] })),
      init: vi.fn(async () => ok),
    },
    commands: { list: vi.fn(async () => ({ commands: state.commands })) },
    backups: { list: vi.fn(async () => ({ backups: [] })), restore: vi.fn(async () => ({ path: '/x' })) },
    markdown: { export: vi.fn(async () => ({ imagePath: '/i.png', markdownPath: '/i.md' })) },
    import: { pickImage: vi.fn(async () => null), pickSvgAsElements: vi.fn(async () => null) },
    snippets: {
      list: vi.fn(async () => ({ snippets: Object.values(state.snippets) })),
      get: vi.fn(async (id: string) => state.snippets[id]),
      save: vi.fn(async (input: any) => {
        const s = { id: input.title, title: input.title, description: '', tags: [], createdAt: 1 };
        state.snippets[s.id] = { ...s, elements: input.elements };
        return s;
      }),
      remove: vi.fn(async (id: string) => (delete state.snippets[id], ok)),
      rename: vi.fn(async () => ({ id: 'x', title: 'x', description: '', tags: [], createdAt: 1 })),
    },
    shortcuts: {
      list: vi.fn(async () => ({ bindings: state.shortcuts })),
      set: vi.fn(async (commandId: string, accelerator: string) => {
        state.shortcuts = [...state.shortcuts.filter((b) => b.commandId !== commandId), { commandId, accelerator }];
        return { bindings: state.shortcuts };
      }),
      reset: vi.fn(async () => ((state.shortcuts = []), { bindings: state.shortcuts })),
    },
    onMenuCommand: vi.fn(() => () => undefined),
  };
  return { api, state };
}

export function installFakeApi(overrides: Partial<FakeState> = {}) {
  const { api, state } = makeFakeApi(overrides);
  (globalThis as any).window.api = api;
  return { api, state };
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { exportToBlob, exportToSvg, serializeAsJSON } from '@excalidraw/excalidraw';
import { CanvasShell } from './components/CanvasShell';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { RightDrawer, DrawerTab } from './components/RightDrawer';
import { CommandPalette } from './components/CommandPalette';
import { PresentationMode } from './components/PresentationMode';
import { WelcomeScreen } from './components/WelcomeScreen';
import { KeyboardHelpOverlay } from './components/KeyboardHelpOverlay';
import { ProfileManagerModal } from './components/ProfileManagerModal';
import { StatusBar } from './components/StatusBar';
import { ExportDialog } from './components/ExportDialog';
import { ToastHost } from './components/ToastHost';
import { toastError, toastInfo, toastSuccess } from './lib/toast';
import * as Shared from '@excalibur/shared';

const BLANK_SCENE = { type: 'excalidraw', version: 2, source: 'excalibur', elements: [], appState: {}, files: {} };

type Contributions = Shared.PluginContributes & { sourcePluginIds: Record<string, string> };
const EMPTY_CONTRIB: Contributions = { toolbar: [], commands: [], panels: [], exportPresets: [], sourcePluginIds: {} };

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<Shared.FileInfo | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Shared.Workspace | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('properties');
  const [contributions, setContributions] = useState<Contributions>(EMPTY_CONTRIB);
  const [sidebarReloadKey, setSidebarReloadKey] = useState(0);
  const [searchSignal, setSearchSignal] = useState(0);
  const [refreshKeys, setRefreshKeys] = useState({ templates: 0, recents: 0, libraries: 0, stats: 0, snippets: 0 });
  const [settings, setSettings] = useState<Shared.Settings | null>(null);
  const [profileName, setProfileName] = useState('You');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileMgrOpen, setProfileMgrOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [elementCount, setElementCount] = useState(0);
  const [presentation, setPresentation] = useState<{ open: boolean; deck: Shared.SlideDeck; index: number }>({
    open: false,
    deck: { slides: [] },
    index: 0,
  });

  const apiRef = useRef<any>(null);
  const justLoaded = useRef(false);

  const bump = (key: keyof typeof refreshKeys) => setRefreshKeys((k) => ({ ...k, [key]: k[key] + 1 }));

  const refreshContributions = useCallback(async () => {
    try {
      setContributions(await window.api.plugins.getContributions());
    } catch {
      setContributions(EMPTY_CONTRIB);
    }
  }, []);

  useEffect(() => {
    refreshContributions();
    window.api.settings.get().then(setSettings).catch(() => {});
    window.api.profiles.getActive().then((p) => p && setProfileName(p.name)).catch(() => {});
  }, [refreshContributions]);

  // ── Scene helpers ────────────────────────────────────────────────────
  const buildScene = useCallback(() => {
    const api = apiRef.current;
    const elements = api ? api.getSceneElements() : canvasData?.elements ?? [];
    const appState = api ? api.getAppState() : canvasData?.appState ?? {};
    const files = api ? api.getFiles() : canvasData?.files ?? {};
    const canonical = JSON.parse(serializeAsJSON(elements, appState, files, 'local'));
    return { ...(canvasData || {}), ...canonical };
  }, [canvasData]);

  const recordRecent = useCallback(async (workspace: Shared.Workspace, file: Shared.FileInfo) => {
    try {
      await window.api.recents.add({
        path: file.path,
        name: file.name,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        openedAt: Date.now(),
      });
      bump('recents');
    } catch {
      /* non-fatal */
    }
  }, []);

  const handleOpenFile = useCallback(
    async (workspace: Shared.Workspace, file: Shared.FileInfo) => {
      try {
        const data = await window.api.workspaces.readExcalidrawFile(workspace.id, file.path);
        justLoaded.current = true;
        setActiveWorkspace(workspace);
        setActiveFile(file);
        setCanvasData(data);
        setDirty(false);
        recordRecent(workspace, file);
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg.includes('No embedded Excalidraw scene') || msg.includes('No embedded Excalidraw data')) {
          toastError(`"${file.name}" has no embedded Excalidraw scene.`);
        } else {
          toastError('Failed to open file: ' + msg);
        }
      }
    },
    [recordRecent],
  );

  const openRecent = useCallback(
    async (r: Shared.RecentFile) => {
      const { workspaces } = await window.api.workspaces.list();
      const ws = workspaces.find((w) => w.id === r.workspaceId) || activeWorkspace;
      if (!ws) return toastError('Workspace for this file is no longer available.');
      await handleOpenFile(ws, {
        name: r.name,
        path: r.path,
        isDirectory: false,
        size: 0,
        mtime: r.openedAt,
        extension: '.' + r.name.split('.').pop(),
      });
    },
    [activeWorkspace, handleOpenFile],
  );

  // ── Save / Save As / New ─────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!activeWorkspace) return toastError('Open a workspace first.');
    if (!activeFile) return saveAs();
    try {
      const scene = buildScene();
      await window.api.workspaces.writeFile(activeWorkspace.id, activeFile.path, JSON.stringify(scene, null, 2));
      setCanvasData(scene);
      setDirty(false);
      toastSuccess('Saved ' + activeFile.name);
    } catch (err: any) {
      toastError('Save failed: ' + (err?.message || ''));
    }
  }, [activeWorkspace, activeFile, buildScene]);

  const saveAs = useCallback(async () => {
    if (!activeWorkspace) return toastError('Open a workspace first.');
    const name = prompt('Save as (name):', activeFile?.name?.replace(/\.[^.]+$/, '') || 'untitled');
    if (!name) return;
    try {
      const scene = buildScene();
      const fileName = name.endsWith('.excalidraw') ? name : `${name}.excalidraw`;
      const dest = `${activeWorkspace.path}/${fileName}`;
      await window.api.workspaces.writeFile(activeWorkspace.id, dest, JSON.stringify(scene, null, 2));
      const file = { name: fileName, path: dest, isDirectory: false, size: 0, mtime: Date.now(), extension: '.excalidraw' };
      setActiveFile(file);
      setCanvasData(scene);
      setDirty(false);
      setSidebarReloadKey((k) => k + 1);
      recordRecent(activeWorkspace, file);
      toastSuccess('Saved ' + fileName);
    } catch (err: any) {
      toastError('Save As failed: ' + (err?.message || ''));
    }
  }, [activeWorkspace, activeFile, buildScene, recordRecent]);

  const newDrawing = useCallback(() => {
    justLoaded.current = true;
    setActiveFile(null);
    setCanvasData({ ...BLANK_SCENE });
    setDirty(false);
    toastInfo('New drawing — use Save As to store it.');
  }, []);

  const openWorkspace = useCallback(async () => {
    const ws = await window.api.workspaces.add();
    if (ws) {
      await window.api.workspaces.setActive(ws.id);
      setActiveWorkspace(ws);
      setSidebarReloadKey((k) => k + 1);
    }
  }, []);

  // ── Export ───────────────────────────────────────────────────────────
  const exportPreset = useCallback(
    async (preset: Shared.ExportPreset) => {
      if (!activeWorkspace) throw new Error('Open a workspace first.');
      const api = apiRef.current;
      const elements = api ? api.getSceneElements() : canvasData?.elements ?? [];
      const baseAppState = api ? api.getAppState() : canvasData?.appState ?? {};
      const appState = { ...baseAppState, exportBackground: preset.background, exportScale: preset.scale };
      const files = api ? api.getFiles() : canvasData?.files ?? {};
      const scene = buildScene();
      const baseName = activeFile?.name?.replace(/\.[^.]+$/, '') || 'untitled';
      const fileName = (preset.nameTemplate || '{name}').replace('{name}', baseName).replace('{preset}', preset.id);
      const ext = preset.format === 'json' ? 'excalidraw' : preset.format;
      const dest = `${activeWorkspace.path}/exports/${fileName}.${ext}`;

      if (preset.format === 'png') {
        const blob = await exportToBlob({ elements, appState, files, mimeType: 'image/png' });
        await window.api.workspaces.exportFile(activeWorkspace.id, dest, 'png', await blobToBase64(blob), scene);
      } else if (preset.format === 'svg') {
        const svg = await exportToSvg({ elements, appState, files, exportPadding: 10 } as any);
        await window.api.workspaces.exportFile(activeWorkspace.id, dest, 'svg', new XMLSerializer().serializeToString(svg), scene);
      } else {
        await window.api.workspaces.exportFile(activeWorkspace.id, dest, 'json', '', scene);
      }
      setSidebarReloadKey((k) => k + 1);
    },
    [activeWorkspace, activeFile, canvasData, buildScene],
  );

  const exportMarkdown = useCallback(async () => {
    if (!activeWorkspace) return toastError('Open a workspace first.');
    const api = apiRef.current;
    if (!api) return;
    const elements = api.getSceneElements();
    const files = api.getFiles();
    const appState = { ...api.getAppState(), exportBackground: true };
    const scene = buildScene();
    const baseName = activeFile?.name?.replace(/\.[^.]+$/, '') || 'drawing';
    const blob = await exportToBlob({ elements, appState, files, mimeType: 'image/png' });
    await window.api.markdown.export(
      activeWorkspace.id,
      baseName,
      { includeFrontmatter: true, imageFormat: 'png', title: baseName, tags: [] },
      await blobToBase64(blob),
      scene,
      '',
    );
    setSidebarReloadKey((k) => k + 1);
    toastSuccess('Exported markdown bundle to exports/');
  }, [activeWorkspace, activeFile, buildScene]);

  // ── Templates / libraries / images ─────────────────────────────────────
  const onUseTemplate = useCallback((tpl: Shared.StoredTemplate) => {
    justLoaded.current = true;
    setActiveFile(null);
    setCanvasData({ ...BLANK_SCENE, ...tpl.scene, elements: tpl.scene?.elements ?? [] });
    setDirty(true);
  }, []);

  const gatherTemplate = useCallback(async () => {
    const title = prompt('Template name:');
    if (!title) return null;
    return { title, scene: buildScene() };
  }, [buildScene]);

  const insertLibrary = useCallback(async (id: string) => {
    try {
      const lib = await window.api.libraries.get(id);
      const els = lib.libraryItems.flatMap((it: any) => it.elements || []);
      if (!els.length) return toastInfo('That library has no items.');
      const api = apiRef.current;
      if (!api) return;
      api.updateScene({ elements: [...api.getSceneElements(), ...els] });
      setDirty(true);
      toastSuccess(`Inserted ${els.length} element(s)`);
    } catch (e: any) {
      toastError(e?.message || 'Insert failed');
    }
  }, []);

  const saveSelectionToLibrary = useCallback(async (id: string) => {
    const api = apiRef.current;
    if (!api) return;
    const selected = api.getAppState().selectedElementIds || {};
    const els = api.getSceneElements().filter((e: any) => selected[e.id]);
    if (!els.length) return toastInfo('Select some elements on the canvas first.');
    await window.api.libraries.addItems(id, [{ elements: els, status: 'published', created: Date.now() }]);
    bump('libraries');
    toastSuccess(`Saved ${els.length} element(s) to library`);
  }, []);

  const importImage = useCallback(async () => {
    try {
      const ins = await window.api.import.pickImage();
      if (!ins) return;
      const api = apiRef.current;
      if (!api) return;
      api.addFiles([ins.file]);
      api.updateScene({ elements: [...api.getSceneElements(), ins.element] });
      setDirty(true);
      toastSuccess('Image inserted');
    } catch (e: any) {
      toastError(e?.message || 'Import failed');
    }
  }, []);

  const importSvg = useCallback(async () => {
    try {
      const res = await window.api.import.pickSvgAsElements();
      if (!res) return;
      const api = apiRef.current;
      if (!api) return;
      if (!res.elements.length) return toastInfo('No convertible shapes found in that SVG.');
      api.updateScene({ elements: [...api.getSceneElements(), ...res.elements] });
      setDirty(true);
      toastSuccess(`Imported ${res.elements.length} element(s)${res.skipped ? ` (${res.skipped} skipped)` : ''}`);
    } catch (e: any) {
      toastError(e?.message || 'SVG import failed');
    }
  }, []);

  const insertSnippet = useCallback(async (id: string) => {
    try {
      const snippet = await window.api.snippets.get(id);
      const api = apiRef.current;
      if (!api || !snippet.elements.length) return;
      api.updateScene({ elements: [...api.getSceneElements(), ...snippet.elements] });
      setDirty(true);
      toastSuccess(`Inserted "${snippet.title}"`);
    } catch (e: any) {
      toastError(e?.message || 'Insert failed');
    }
  }, []);

  const gatherSnippet = useCallback(async () => {
    const api = apiRef.current;
    if (!api) return null;
    const selected = api.getAppState().selectedElementIds || {};
    const els = api.getSceneElements().filter((e: any) => selected[e.id]);
    if (!els.length) {
      toastInfo('Select some elements on the canvas first.');
      return null;
    }
    const title = prompt('Snippet name:');
    if (!title) return null;
    return { title, elements: els };
  }, []);

  // ── Presentation ──────────────────────────────────────────────────────
  const gotoSlide = useCallback((deck: Shared.SlideDeck, i: number) => {
    const slide = deck.slides[i];
    const api = apiRef.current;
    if (slide && api?.scrollToContent) {
      const el = api.getSceneElements().find((e: any) => e.id === slide.id);
      if (el) {
        try {
          api.scrollToContent(el, { fitToViewport: true });
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  const startPresentation = useCallback(async () => {
    const scene = buildScene();
    let deck: Shared.SlideDeck;
    if (activeWorkspace) {
      // The main process derives slides (from frames) and merges presenter notes.
      deck = await window.api.presentation.getDeck(activeWorkspace.id, activeFile?.path || 'scratch', scene);
    } else {
      deck = { slides: [] };
    }
    setPresentation({ open: true, deck, index: 0 });
    gotoSlide(deck, 0);
  }, [activeWorkspace, activeFile, buildScene, gotoSlide]);

  // ── Command dispatch ────────────────────────────────────────────────────
  const openDrawer = (tab: DrawerTab) => {
    setDrawerOpen(true);
    setDrawerTab(tab);
  };

  const dispatchCommand = useCallback(
    async (id: string) => {
      const presetFor = (pid: string) => contributions.exportPresets.find((p) => p.id === pid);
      try {
        switch (id) {
          case 'core.save': return save();
          case 'core.save-as': return saveAs();
          case 'core.new': return newDrawing();
          case 'core.export': return setExportDialogOpen(true);
          case 'core.export-markdown': return exportMarkdown();
          case 'core.search': return setSearchSignal((s) => s + 1);
          case 'core.recents': return openDrawer('recents');
          case 'core.toggle-properties': return openDrawer('properties');
          case 'core.toggle-templates': return openDrawer('templates');
          case 'core.toggle-libraries': return openDrawer('libraries');
          case 'core.toggle-review': return openDrawer('review');
          case 'core.toggle-stats': return openDrawer('stats');
          case 'core.toggle-git': return openDrawer('git');
          case 'core.toggle-plugins': openDrawer('plugins'); return refreshContributions();
          case 'core.toggle-ai': return openDrawer('ai');
          case 'core.presentation': return startPresentation();
          case 'core.import-image': return importImage();
          case 'core.import-svg': return importSvg();
          case 'core.command-palette': return setPaletteOpen(true);
          case 'core.toggle-snippets': return openDrawer('snippets');
          case 'core.save-snippet': {
            const data = await gatherSnippet();
            if (data) {
              await window.api.snippets.save({ title: data.title, elements: data.elements });
              bump('snippets');
              toastSuccess(`Saved snippet "${data.title}"`);
            }
            return;
          }
          case 'core.settings': return setIsSettingsOpen(true);
          case 'core.save-template': {
            const data = await gatherTemplate();
            if (data) {
              await window.api.templates.save({ title: data.title, scene: data.scene });
              bump('templates');
              toastSuccess(`Saved template "${data.title}"`);
            }
            return;
          }
          // Plugin contributions
          case 'qep-batch-export': {
            if (!contributions.exportPresets.length) return toastInfo('No export presets available.');
            for (const p of contributions.exportPresets) await exportPreset(p);
            return toastSuccess(`Batch exported ${contributions.exportPresets.length} preset(s).`);
          }
          case 'qep-export-web':
            if (presetFor('web')) { await exportPreset(presetFor('web')!); toastSuccess('Exported web PNG'); }
            return;
          case 'qep-export-print':
            if (presetFor('print')) { await exportPreset(presetFor('print')!); toastSuccess('Exported print PNG'); }
            return;
          case 'qep-export-svg':
            if (presetFor('vector')) { await exportPreset(presetFor('vector')!); toastSuccess('Exported SVG'); }
            return;
          case 'tpl-gallery':
          case 'tpl-new-from':
            return openDrawer('templates');
          case 'tpl-save-current':
            return dispatchCommand('core.save-template');
          default:
            toastInfo(`Command "${id}" has no host handler.`);
        }
      } catch (e: any) {
        toastError(e?.message || 'Command failed');
      }
    },
    [contributions, save, saveAs, newDrawing, exportMarkdown, exportPreset, gatherTemplate, startPresentation, importImage, importSvg, gatherSnippet, refreshContributions],
  );

  // ── Native menu + keyboard shortcuts ─────────────────────────────────
  const menuHandler = useCallback(
    (cmd: string) => {
      const map: Record<string, string> = {
        save: 'core.save',
        'save-as': 'core.save-as',
        new: 'core.new',
        export: 'core.export',
        'toggle-plugins': 'core.toggle-plugins',
        'toggle-ai': 'core.toggle-ai',
      };
      if (cmd === 'open') return toastInfo('Pick a file from the sidebar to open it.');
      if (map[cmd]) dispatchCommand(map[cmd]);
    },
    [dispatchCommand],
  );

  const dispatchRef = useRef(dispatchCommand);
  dispatchRef.current = dispatchCommand;
  const menuRef = useRef(menuHandler);
  menuRef.current = menuHandler;

  useEffect(() => {
    const unsub = window.api?.onMenuCommand?.((cmd) => menuRef.current(cmd));
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key === '?' && !mod) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setHelpOpen(true);
        return;
      }
      if (!mod) return;
      const k = e.key.toLowerCase();
      const d = dispatchRef.current;
      if (k === 's' && e.shiftKey) { e.preventDefault(); d('core.save-as'); }
      else if (k === 's') { e.preventDefault(); d('core.save'); }
      else if (k === 'n') { e.preventDefault(); d('core.new'); }
      else if (k === 'p' && e.shiftKey) { e.preventDefault(); d('core.toggle-plugins'); }
      else if (k === 'p') { e.preventDefault(); d('core.export'); }
      else if (k === 'i') { e.preventDefault(); d('core.toggle-ai'); }
      else if (k === 'f') { e.preventDefault(); d('core.search'); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unsub?.();
    };
  }, []);

  const onAiApplied = useCallback(() => {
    refreshContributions();
    bump('templates');
    bump('libraries');
    setSidebarReloadKey((k) => k + 1);
  }, [refreshContributions]);

  // Autosave: periodically persist the open file when there are unsaved edits.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!settings?.autosave) return;
    const ms = Math.max(2, settings.autosaveIntervalSeconds) * 1000;
    const timer = setInterval(() => {
      if (dirty && activeFile && activeWorkspace) saveRef.current();
    }, ms);
    return () => clearInterval(timer);
  }, [settings?.autosave, settings?.autosaveIntervalSeconds, dirty, activeFile, activeWorkspace]);

  // Apply the chosen theme to the shell (light/dark/system).
  const resolvedTheme = (() => {
    const t = settings?.theme ?? 'dark';
    if (t === 'system') {
      return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return t;
  })();
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const headerTab = (tab: DrawerTab, label: string) => (
    <button
      onClick={() => {
        if (tab === 'plugins') refreshContributions();
        openDrawer(tab);
      }}
      className="btn-ghost"
      style={{ fontSize: 12, padding: '6px 12px', opacity: drawerOpen && drawerTab === tab ? 1 : 0.75 }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, backgroundColor: 'var(--bg-1)', borderBottom: '1px solid var(--border-0)', display: 'flex', alignItems: 'center', padding: '0 var(--s-lg)', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-md)' }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            EXCALIBUR
          </h1>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
            / {activeFile?.name || 'untitled'} {dirty && <span style={{ color: 'var(--orange-500)' }}>•</span>}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-sm)', alignItems: 'center' }}>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setPaletteOpen(true)} title="Command palette (Ctrl+K)">
            ⌘ Commands
          </button>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={save}>Save</button>
          {headerTab('plugins', '🧩 Plugins')}
          {headerTab('ai', '✨ AI')}
          <ProfileSwitcher onManage={() => setProfileMgrOpen(true)} />
          <button onClick={() => setIsSettingsOpen(true)} title="Settings" style={{ backgroundColor: 'transparent', color: 'var(--text-2)', fontSize: 18, padding: 4 }}>⚙️</button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <WorkspaceSidebar onOpenFile={handleOpenFile} reloadKey={sidebarReloadKey} onWorkspaceChange={setActiveWorkspace} focusSignal={searchSignal} />
        <main style={{ flex: 1, position: 'relative' }}>
          <CanvasShell
            initialData={canvasData}
            onApiReady={(api) => (apiRef.current = api)}
            onChange={() => {
              const count = apiRef.current?.getSceneElements?.()?.length ?? 0;
              setElementCount(count);
              if (justLoaded.current) {
                justLoaded.current = false;
                return;
              }
              if (!dirty) setDirty(true);
            }}
            onSave={save}
            toolbarItems={contributions.toolbar}
            onToolbarAction={dispatchCommand}
            gridEnabled={settings?.showGrid}
            theme={resolvedTheme}
          />
          {!activeFile && !canvasData && (
            <WelcomeScreen
              onNewDrawing={newDrawing}
              onOpenWorkspace={openWorkspace}
              onOpenCommands={() => setPaletteOpen(true)}
              hasWorkspace={!!activeWorkspace}
            />
          )}
        </main>
        <RightDrawer
          open={drawerOpen}
          tab={drawerTab}
          onTab={setDrawerTab}
          onClose={() => setDrawerOpen(false)}
          activeFile={activeFile}
          activeWorkspace={activeWorkspace}
          presets={contributions.exportPresets}
          onExport={exportPreset}
          onUseTemplate={onUseTemplate}
          onSaveCurrentTemplate={gatherTemplate}
          onOpenRecent={openRecent}
          onInsertLibrary={insertLibrary}
          onSaveSelectionToLibrary={saveSelectionToLibrary}
          onInsertSnippet={insertSnippet}
          onSaveSnippet={gatherSnippet}
          onOpenFile={handleOpenFile}
          reviewAuthor={profileName}
          refreshKeys={refreshKeys}
          onAiApplied={onAiApplied}
        />
      </div>

      <StatusBar
        fileName={activeFile?.name ?? null}
        dirty={dirty}
        elementCount={elementCount}
        autosave={!!settings?.autosave}
        workspaceName={activeWorkspace?.name ?? null}
        theme={resolvedTheme}
      />

      {!drawerOpen && (
        <button onClick={() => setDrawerOpen(true)} title="Open panel" style={{ position: 'fixed', right: 16, top: 72, zIndex: 200, backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-0)', color: 'var(--text-1)', padding: '8px 10px', boxShadow: 'var(--shadow-1)' }}>
          ◧
        </button>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onRun={(id) => dispatchCommand(id)} />
      {presentation.open && (
        <PresentationMode
          deck={presentation.deck}
          index={presentation.index}
          onIndex={(i) => {
            setPresentation((p) => ({ ...p, index: i }));
            gotoSlide(presentation.deck, i);
          }}
          onExit={() => setPresentation((p) => ({ ...p, open: false }))}
        />
      )}

      <KeyboardHelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ProfileManagerModal isOpen={profileMgrOpen} onClose={() => setProfileMgrOpen(false)} />
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={exportPreset}
        baseName={activeFile?.name?.replace(/\.[^.]+$/, '') || 'untitled'}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          window.api.settings.get().then(setSettings).catch(() => {});
        }}
      />
      <ToastHost />
    </div>
  );
}

export default App;

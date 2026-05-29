import React, { useState, useEffect, useRef, useCallback } from 'react';
import { exportToBlob, exportToSvg, serializeAsJSON } from '@excalidraw/excalidraw';
import { CanvasShell } from './components/CanvasShell';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { RightDrawer, DrawerTab } from './components/RightDrawer';
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
  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);
  const [settings, setSettings] = useState<Shared.Settings | null>(null);

  const apiRef = useRef<any>(null);
  const justLoaded = useRef(false);

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
  }, [refreshContributions]);

  // ── Scene helpers ────────────────────────────────────────────────────
  const buildScene = useCallback(() => {
    const api = apiRef.current;
    const elements = api ? api.getSceneElements() : canvasData?.elements ?? [];
    const appState = api ? api.getAppState() : canvasData?.appState ?? {};
    const files = api ? api.getFiles() : canvasData?.files ?? {};
    // Canonical Excalidraw JSON, then preserve any extra top-level metadata.
    const canonical = JSON.parse(serializeAsJSON(elements, appState, files, 'local'));
    return { ...(canvasData || {}), ...canonical };
  }, [canvasData]);

  const handleOpenFile = useCallback(async (workspace: Shared.Workspace, file: Shared.FileInfo) => {
    try {
      const data = await window.api.workspaces.readExcalidrawFile(workspace.id, file.path);
      justLoaded.current = true;
      setActiveWorkspace(workspace);
      setActiveFile(file);
      setCanvasData(data);
      setDirty(false);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('No embedded Excalidraw scene') || msg.includes('No embedded Excalidraw data')) {
        toastError(`"${file.name}" has no embedded Excalidraw scene.`);
      } else {
        toastError('Failed to open file: ' + msg);
      }
    }
  }, []);

  // ── Save / Save As / New ─────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!activeWorkspace) {
      toastError('Open a workspace first.');
      return;
    }
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
    if (!activeWorkspace) {
      toastError('Open a workspace first.');
      return;
    }
    const name = prompt('Save as (name):', activeFile?.name?.replace(/\.[^.]+$/, '') || 'untitled');
    if (!name) return;
    try {
      const scene = buildScene();
      const fileName = name.endsWith('.excalidraw') ? name : `${name}.excalidraw`;
      const dest = `${activeWorkspace.path}/${fileName}`;
      await window.api.workspaces.writeFile(activeWorkspace.id, dest, JSON.stringify(scene, null, 2));
      setActiveFile({ name: fileName, path: dest, isDirectory: false, size: 0, mtime: Date.now(), extension: '.excalidraw' });
      setCanvasData(scene);
      setDirty(false);
      setSidebarReloadKey((k) => k + 1);
      toastSuccess('Saved ' + fileName);
    } catch (err: any) {
      toastError('Save As failed: ' + (err?.message || ''));
    }
  }, [activeWorkspace, activeFile, buildScene]);

  const newDrawing = useCallback(() => {
    justLoaded.current = true;
    setActiveFile(null);
    setCanvasData({ ...BLANK_SCENE });
    setDirty(false);
    toastInfo('New drawing — use Save As to store it.');
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
        const b64 = await blobToBase64(blob);
        await window.api.workspaces.exportFile(activeWorkspace.id, dest, 'png', b64, scene);
      } else if (preset.format === 'svg') {
        const svg = await exportToSvg({ elements, appState, files, exportPadding: 10 } as any);
        const str = new XMLSerializer().serializeToString(svg);
        await window.api.workspaces.exportFile(activeWorkspace.id, dest, 'svg', str, scene);
      } else {
        await window.api.workspaces.exportFile(activeWorkspace.id, dest, 'json', '', scene);
      }
      setSidebarReloadKey((k) => k + 1);
    },
    [activeWorkspace, activeFile, canvasData, buildScene],
  );

  // ── Templates ────────────────────────────────────────────────────────
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

  // ── Command dispatch (plugin toolbar/commands + native menu) ──────────
  const runCommand = useCallback(
    async (id: string) => {
      const presetFor = (pid: string) => contributions.exportPresets.find((p) => p.id === pid);
      try {
        switch (id) {
          // Quick Export Presets plugin
          case 'qep-batch-export': {
            if (!contributions.exportPresets.length) return toastInfo('No export presets available.');
            for (const p of contributions.exportPresets) await exportPreset(p);
            return toastSuccess(`Batch exported ${contributions.exportPresets.length} preset(s).`);
          }
          case 'qep-export-web':
            return presetFor('web') ? (await exportPreset(presetFor('web')!), toastSuccess('Exported web PNG')) : undefined;
          case 'qep-export-print':
            return presetFor('print') ? (await exportPreset(presetFor('print')!), toastSuccess('Exported print PNG')) : undefined;
          case 'qep-export-svg':
            return presetFor('vector') ? (await exportPreset(presetFor('vector')!), toastSuccess('Exported SVG')) : undefined;
          // Templates plugin
          case 'tpl-gallery':
          case 'tpl-new-from':
            setDrawerOpen(true);
            setDrawerTab('templates');
            return;
          case 'tpl-save-current': {
            const data = await gatherTemplate();
            if (data) {
              await window.api.templates.save({ title: data.title, scene: data.scene });
              setTemplatesRefreshKey((k) => k + 1);
              toastSuccess(`Saved template "${data.title}"`);
            }
            return;
          }
          default:
            toastInfo(`Command "${id}" has no host handler.`);
        }
      } catch (e: any) {
        toastError(e?.message || 'Command failed');
      }
    },
    [contributions, exportPreset, gatherTemplate],
  );

  // ── Native menu + keyboard shortcuts ─────────────────────────────────
  const menuHandler = useCallback(
    (cmd: string) => {
      switch (cmd) {
        case 'save': return save();
        case 'save-as': return saveAs();
        case 'new': return newDrawing();
        case 'open': return toastInfo('Pick a file from the sidebar to open it.');
        case 'export': {
          setDrawerOpen(true);
          setDrawerTab('properties');
          return;
        }
        case 'toggle-plugins':
          setDrawerOpen(true);
          setDrawerTab('plugins');
          return refreshContributions();
        case 'toggle-ai':
          setDrawerOpen(true);
          setDrawerTab('ai');
          return;
      }
    },
    [save, saveAs, newDrawing, refreshContributions],
  );

  const menuRef = useRef(menuHandler);
  menuRef.current = menuHandler;

  useEffect(() => {
    const unsub = window.api?.onMenuCommand?.((cmd) => menuRef.current(cmd));
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 's' && e.shiftKey) { e.preventDefault(); menuRef.current('save-as'); }
      else if (k === 's') { e.preventDefault(); menuRef.current('save'); }
      else if (k === 'n') { e.preventDefault(); menuRef.current('new'); }
      else if (k === 'p' && e.shiftKey) { e.preventDefault(); menuRef.current('toggle-plugins'); }
      else if (k === 'p') { e.preventDefault(); menuRef.current('export'); }
      else if (k === 'i') { e.preventDefault(); menuRef.current('toggle-ai'); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unsub?.();
    };
  }, []);

  const onAiApplied = useCallback(() => {
    refreshContributions();
    setTemplatesRefreshKey((k) => k + 1);
    setSidebarReloadKey((k) => k + 1);
  }, [refreshContributions]);

  const headerTab = (tab: DrawerTab, label: string) => (
    <button
      onClick={() => {
        if (tab === 'plugins') refreshContributions();
        setDrawerOpen(true);
        setDrawerTab(tab);
      }}
      className="btn-ghost"
      style={{ fontSize: 12, padding: '6px 12px', opacity: drawerOpen && drawerTab === tab ? 1 : 0.75 }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          height: 56,
          backgroundColor: 'var(--bg-1)',
          borderBottom: '1px solid var(--border-0)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--s-lg)',
          justifyContent: 'space-between',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-md)' }}>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 800,
              margin: 0,
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            EXCALIBUR
          </h1>
          {activeFile ? (
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              / {activeFile.name} {dirty && <span style={{ color: 'var(--orange-500)' }}>•</span>}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>/ untitled {dirty && '•'}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-sm)', alignItems: 'center' }}>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={save}>
            Save
          </button>
          {headerTab('templates', '▦ Templates')}
          {headerTab('plugins', '🧩 Plugins')}
          {headerTab('ai', '✨ AI Import')}
          <ProfileSwitcher />
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            style={{ backgroundColor: 'transparent', color: 'var(--text-2)', fontSize: 18, padding: 4 }}
          >
            ⚙️
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <WorkspaceSidebar
          onOpenFile={handleOpenFile}
          reloadKey={sidebarReloadKey}
          onWorkspaceChange={setActiveWorkspace}
        />
        <main style={{ flex: 1, position: 'relative' }}>
          <CanvasShell
            initialData={canvasData}
            onApiReady={(api) => (apiRef.current = api)}
            onChange={() => {
              if (justLoaded.current) {
                justLoaded.current = false;
                return;
              }
              if (!dirty) setDirty(true);
            }}
            onSave={save}
            toolbarItems={contributions.toolbar}
            onToolbarAction={runCommand}
            gridEnabled={settings?.showGrid}
          />
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
          templatesRefreshKey={templatesRefreshKey}
          onAiApplied={onAiApplied}
        />
      </div>

      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          title="Open panel"
          style={{
            position: 'fixed',
            right: 16,
            top: 72,
            zIndex: 200,
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border-0)',
            color: 'var(--text-1)',
            padding: '8px 10px',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          ◧
        </button>
      )}

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

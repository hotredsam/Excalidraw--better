import React, { useState, useEffect } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';

import * as Shared from '@excalibur/shared';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<Shared.FileInfo | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Shared.Workspace | null>(null);
  const [canvasData, setCanvasData] = useState<Shared.ExcalidrawFile | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenFile = async (workspace: Shared.Workspace, file: Shared.FileInfo) => {
    try {
      const data = await window.api.workspaces.readExcalidrawFile(workspace.id, file.path);
      setActiveWorkspace(workspace);
      setActiveFile(file);
      setCanvasData(data);
    } catch (err: unknown) {
      console.error('Failed to open file:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage({ type: 'error', text: 'Failed to open file: ' + message });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSave = async (elements: any[], appState: any) => {
    if (!activeWorkspace || !activeFile || !canvasData) return;

    try {
      const merged = Shared.mergeExcalidraw(canvasData, elements, appState);
      const content = JSON.stringify(merged, null, 2);
      await window.api.workspaces.writeFile(activeWorkspace.id, activeFile.path, content);
      setCanvasData(merged); // Update local state with merged data
      setStatusMessage({ type: 'success', text: 'Saved successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      console.error('Failed to save:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage({ type: 'error', text: 'Save failed: ' + message });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSaveRef = React.useRef(handleSave);
  handleSaveRef.current = handleSave;

  const handleSaveAs = async () => {
    // Save As functionality - for now calls handleSave
    // Future enhancement: implement actual "Save As" dialog
    if (activeFile) {
      document.dispatchEvent(new CustomEvent('excalibur:saveAs'));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) {
          document.dispatchEvent(new CustomEvent('excalibur:save'));
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleSaveAs();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  useEffect(() => {
    document.title = activeFile ? `${activeFile.name} — Excalibur` : 'Excalibur';
  }, [activeFile]);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        height: '56px', 
        backgroundColor: 'var(--bg-1)', 
        borderBottom: '1px solid var(--border-0)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--s-lg)',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-md)' }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            margin: 0, 
            color: 'var(--orange-700)',
            letterSpacing: '-0.02em'
          }}>
            EXCALIBUR
          </h1>
          {activeFile && (
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>
              / {activeFile.name}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--s-md)', alignItems: 'center' }}>
           <ProfileSwitcher />
           <button 
             onClick={() => setIsSettingsOpen(true)}
             style={{ 
               backgroundColor: 'transparent', 
               color: 'var(--text-2)', 
               fontSize: '18px',
               padding: '4px' 
             }}
           >
             ⚙️
           </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar onOpenFile={handleOpenFile} />
        <main style={{ flex: 1, position: 'relative' }}>
          <CanvasShell initialData={canvasData} onSave={handleSave} />
        </main>
      </div>

      {statusMessage && (
        <div style={{
          position: 'fixed',
          top: '72px',
          right: '16px',
          backgroundColor: statusMessage.type === 'success' ? 'var(--orange-600)' : '#dc2626',
          color: 'white',
          padding: 'var(--s-sm) var(--s-lg)',
          borderRadius: 'var(--r-md)',
          fontSize: '14px',
          zIndex: 500
        }}>
          {statusMessage.text}
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;

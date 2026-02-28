import React, { useState } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';

import * as Shared from '@excalibur/shared';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<Shared.FileInfo | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Shared.Workspace | null>(null);
  const [canvasData, setCanvasData] = useState<Shared.ExcalidrawFile | null>(null);

  const handleOpenFile = async (workspace: Shared.Workspace, file: Shared.FileInfo) => {
    try {
      const data = await window.api.workspaces.readExcalidrawFile(workspace.id, file.path);
      setActiveWorkspace(workspace);
      setActiveFile(file);
      setCanvasData(data);
    } catch (err: any) {
      console.error('Failed to open file:', err);
      alert('Failed to open file: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSave = async (elements: any[], appState: any) => {
    if (!activeWorkspace || !activeFile || !canvasData) return;
    
    try {
      const merged = Shared.mergeExcalidraw(canvasData, elements, appState);
      const content = JSON.stringify(merged, null, 2);
      await window.api.workspaces.writeFile(activeWorkspace.id, activeFile.path, content);
      setCanvasData(merged); // Update local state with merged data
      alert('Saved successfully!');
    } catch (err: any) {
      console.error('Failed to save:', err);
      alert('Save failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* ... header unchanged ... */}
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
        <WorkspaceSidebar onOpenFile={handleOpenFile} />
        <main style={{ flex: 1, position: 'relative' }}>
          <CanvasShell initialData={canvasData} onSave={handleSave} />
        </main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;

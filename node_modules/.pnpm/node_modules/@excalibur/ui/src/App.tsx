import React, { useState } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';

import { Workspace, FileInfo } from '@excalibur/shared';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<FileInfo | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [canvasData, setCanvasData] = useState<any>(null);

  const handleOpenFile = async (workspace: Workspace, file: FileInfo) => {
    try {
      const content = await window.api.workspaces.readFile(workspace.id, file.path);
      const data = JSON.parse(content);
      setActiveWorkspace(workspace);
      setActiveFile(file);
      setCanvasData(data);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleSave = async (elements: any[], appState: any) => {
    if (!activeWorkspace || !activeFile) return;
    
    try {
      const content = JSON.stringify({ elements, appState }, null, 2);
      await window.api.workspaces.writeFile(activeWorkspace.id, activeFile.path, content);
      alert('Saved successfully!');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Save failed: ' + err);
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

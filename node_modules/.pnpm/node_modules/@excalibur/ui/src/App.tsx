import React, { useState } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar Shell */}
      <header style={{ 
        height: '56px', 
        backgroundColor: 'var(--bg-1)', 
        borderBottom: '1px solid var(--border-0)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--s-lg)',
        justifyContent: 'space-between'
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

      <main style={{ flex: 1, position: 'relative' }}>
        <CanvasShell />
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;

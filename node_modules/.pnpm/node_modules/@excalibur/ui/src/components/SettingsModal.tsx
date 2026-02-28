import React, { useState, useEffect } from 'react';
import { Settings } from '@excalibur/shared';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (isOpen) {
      window.api.settings.get().then(setSettings);
    }
  }, [isOpen]);

  if (!isOpen || !settings) return null;

  const update = async (partial: Partial<Settings>) => {
    const updated = await window.api.settings.update(partial);
    setSettings(updated);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 2000 
    }}>
      <div style={{ 
        width: '400px', 
        backgroundColor: 'var(--bg-1)', 
        borderRadius: 'var(--r-lg)', 
        border: '1px solid var(--border-0)',
        padding: 'var(--s-xl)'
      }}>
        <h2 style={{ marginTop: 0, color: 'var(--orange-600)' }}>Settings</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-lg)' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Autosave</span>
            <input 
              type="checkbox" 
              checked={settings.autosave} 
              onChange={e => update({ autosave: e.target.checked })} 
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Confirm on Delete</span>
            <input 
              type="checkbox" 
              checked={settings.confirmOnDelete} 
              onChange={e => update({ confirmOnDelete: e.target.checked })} 
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Export Format</span>
            <select 
              value={settings.defaultExportFormat}
              onChange={e => update({ defaultExportFormat: e.target.value as any })}
              style={{ backgroundColor: 'var(--bg-2)', color: 'white', border: '1px solid var(--border-0)', borderRadius: '4px' }}
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
            </select>
          </label>
        </div>

        <button 
          onClick={onClose}
          style={{ 
            marginTop: 'var(--s-xl)', 
            width: '100%', 
            padding: 'var(--s-md)', 
            backgroundColor: 'var(--bg-2)', 
            color: 'white' 
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

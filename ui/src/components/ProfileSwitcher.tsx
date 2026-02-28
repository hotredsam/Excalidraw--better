import React, { useState, useEffect } from 'react';
import { Profile, ProfileList } from '@excalibur/shared';

export const ProfileSwitcher: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadData = async () => {
    const active = await window.api.profiles.getActive();
    const list = await window.api.profiles.list();
    setActiveProfile(active);
    setProfiles(list.profiles);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitch = async (id: string) => {
    await window.api.profiles.setActive(id);
    await loadData();
    window.location.reload(); // Simple way to reset app state on profile switch
  };

  const handleCreate = async () => {
    const name = prompt('Profile Name:');
    if (name) {
      await window.api.profiles.create(name);
      await loadData();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: 'var(--bg-2)', 
          padding: 'var(--s-xs) var(--s-lg)', 
          borderRadius: 'var(--r-pill)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-1)',
          border: '1px solid var(--border-0)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-sm)'
        }}
      >
        <span>{activeProfile?.name || 'Loading...'}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: 'calc(100% + 8px)', 
          right: 0, 
          width: '200px', 
          backgroundColor: 'var(--bg-2)', 
          borderRadius: 'var(--r-md)', 
          border: '1px solid var(--border-0)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 1000,
          padding: 'var(--s-sm) 0'
        }}>
          {profiles.map(p => (
            <div 
              key={p.id}
              onClick={() => handleSwitch(p.id)}
              style={{ 
                padding: 'var(--s-sm) var(--s-lg)', 
                cursor: 'pointer',
                backgroundColor: p.id === activeProfile?.id ? 'var(--bg-3)' : 'transparent',
                fontSize: '14px'
              }}
            >
              {p.name}
            </div>
          ))}
          <div style={{ height: '1px', backgroundColor: 'var(--border-0)', margin: 'var(--s-sm) 0' }} />
          <div 
            onClick={handleCreate}
            style={{ 
              padding: 'var(--s-sm) var(--s-lg)', 
              cursor: 'pointer',
              color: 'var(--orange-600)',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            + Create Profile
          </div>
        </div>
      )}
    </div>
  );
};

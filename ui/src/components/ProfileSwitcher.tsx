import React, { useState, useEffect } from 'react';
import { Profile, ProfileList } from '@excalibur/shared';

export const ProfileSwitcher: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

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
    if (newProfileName.trim()) {
      await window.api.profiles.create(newProfileName);
      await loadData();
      setNewProfileName('');
      setIsCreating(false);
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
          {!isCreating ? (
            <div
              onClick={() => setIsCreating(true)}
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
          ) : (
            <div style={{ padding: 'var(--s-sm) var(--s-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--s-sm)' }}>
              <input
                type="text"
                placeholder="Profile name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewProfileName('');
                  }
                }}
                autoFocus
                style={{
                  backgroundColor: 'var(--bg-1)',
                  color: 'var(--text-1)',
                  border: '1px solid var(--border-0)',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleCreate}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--orange-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewProfileName('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-1)',
                    color: 'var(--text-1)',
                    border: '1px solid var(--border-0)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

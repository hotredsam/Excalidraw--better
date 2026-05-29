import React, { useEffect, useState } from 'react';
import { Profile } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

/**
 * Full profile management: create, rename, delete, and switch profiles. The
 * switcher in the top bar handles quick switching; this modal is the full CRUD
 * surface (Product Spec §5 — "create/delete/profile settings").
 */
export const ProfileManagerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = async () => {
    const [list, active] = await Promise.all([window.api.profiles.list(), window.api.profiles.getActive()]);
    setProfiles(list.profiles);
    setActiveId(active?.id ?? null);
  };

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  if (!isOpen) return null;

  const create = async () => {
    const name = prompt('New profile name:');
    if (!name) return;
    await window.api.profiles.create(name);
    toastSuccess(`Created profile "${name}"`);
    refresh();
  };

  const rename = async (p: Profile) => {
    const name = prompt('Rename profile:', p.name);
    if (!name || name === p.name) return;
    await window.api.profiles.rename(p.id, name);
    refresh();
  };

  const remove = async (p: Profile) => {
    if (profiles.length <= 1) return toastError('You cannot delete the only profile.');
    if (!confirm(`Delete profile "${p.name}"? Its settings, vault, templates and plugins are removed.`)) return;
    try {
      await window.api.profiles.delete(p.id);
      toastSuccess(`Deleted "${p.name}"`);
      refresh();
    } catch (e: any) {
      toastError(e?.message || 'Delete failed');
    }
  };

  const switchTo = async (p: Profile) => {
    await window.api.profiles.setActive(p.id);
    window.location.reload();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--orange-600)' }}>Profiles</h2>
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={create}>
            + New profile
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Each profile is an isolated sandbox: its own settings, vault, templates, libraries and enabled plugins.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {profiles.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--s-md)',
                borderRadius: 'var(--r-md)',
                border: `1px solid ${p.id === activeId ? 'var(--orange-600)' : 'var(--border-0)'}`,
                backgroundColor: 'var(--bg-2)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {p.name} {p.id === activeId && <span className="chip">active</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  Last opened {new Date(p.lastOpenedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {p.id !== activeId && (
                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => switchTo(p)}>
                    Switch
                  </button>
                )}
                <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => rename(p)}>
                  Rename
                </button>
                <button style={{ background: 'transparent', color: 'var(--danger)', fontSize: 11 }} onClick={() => remove(p)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ marginTop: 'var(--s-xl)', width: '100%', padding: 'var(--s-md)', backgroundColor: 'var(--bg-2)', color: 'var(--text-0)' }}>
          Close
        </button>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2100,
};
const modal: React.CSSProperties = {
  width: 480,
  maxHeight: '86vh',
  overflowY: 'auto',
  backgroundColor: 'var(--bg-1)',
  borderRadius: 'var(--r-lg)',
  border: '1px solid var(--border-0)',
  padding: 'var(--s-xl)',
};

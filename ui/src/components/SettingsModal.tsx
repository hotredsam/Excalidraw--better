import React, { useState, useEffect } from 'react';
import { Settings } from '@excalibur/shared';
import { ShortcutsEditor } from './ShortcutsEditor';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (isOpen) window.api.settings.get().then(setSettings);
  }, [isOpen]);

  if (!isOpen || !settings) return null;

  const update = async (partial: Partial<Settings>) => setSettings(await window.api.settings.update(partial));

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      {children}
    </label>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ width: 440, maxHeight: '86vh', overflowY: 'auto', backgroundColor: 'var(--bg-1)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-0)', padding: 'var(--s-xl)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--orange-600)' }}>Settings</h2>

        <h4 style={section}>Editing</h4>
        <div style={col}>
          <Row label="Autosave">
            <input type="checkbox" checked={settings.autosave} onChange={(e) => update({ autosave: e.target.checked })} />
          </Row>
          <Row label="Autosave interval (s)">
            <input type="number" min={2} max={600} value={settings.autosaveIntervalSeconds} style={{ width: 80 }} onChange={(e) => update({ autosaveIntervalSeconds: Number(e.target.value) })} />
          </Row>
          <Row label="Show grid">
            <input type="checkbox" checked={settings.showGrid} onChange={(e) => update({ showGrid: e.target.checked })} />
          </Row>
          <Row label="Theme">
            <select value={settings.theme} onChange={(e) => update({ theme: e.target.value as any })}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </Row>
        </div>

        <h4 style={section}>Files</h4>
        <div style={col}>
          <Row label="Default export format">
            <select value={settings.defaultExportFormat} onChange={(e) => update({ defaultExportFormat: e.target.value as any })}>
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
            </select>
          </Row>
          <Row label="Confirm on delete">
            <input type="checkbox" checked={settings.confirmOnDelete} onChange={(e) => update({ confirmOnDelete: e.target.checked })} />
          </Row>
          <Row label="Recent files to keep">
            <input type="number" min={1} max={100} value={settings.recentsLimit} style={{ width: 80 }} onChange={(e) => update({ recentsLimit: Number(e.target.value) })} />
          </Row>
          <Row label="Index embedded text (search)">
            <input type="checkbox" checked={settings.indexEmbeddedText} onChange={(e) => update({ indexEmbeddedText: e.target.checked })} />
          </Row>
        </div>

        <h4 style={section}>History &amp; safety</h4>
        <div style={col}>
          <Row label="Keep backups on save">
            <input type="checkbox" checked={settings.keepBackups} onChange={(e) => update({ keepBackups: e.target.checked })} />
          </Row>
          <Row label="Backups to keep per file">
            <input type="number" min={1} max={50} value={settings.backupsToKeep} style={{ width: 80 }} onChange={(e) => update({ backupsToKeep: Number(e.target.value) })} />
          </Row>
          <Row label="Auto-open last workspace">
            <input type="checkbox" checked={settings.autoOpenLastWorkspace} onChange={(e) => update({ autoOpenLastWorkspace: e.target.checked })} />
          </Row>
        </div>

        <h4 style={section}>Keyboard shortcuts</h4>
        <ShortcutsEditor />

        <button onClick={onClose} style={{ marginTop: 'var(--s-xl)', width: '100%', padding: 'var(--s-md)', backgroundColor: 'var(--bg-2)', color: 'white' }}>
          Close
        </button>
      </div>
    </div>
  );
};

const section: React.CSSProperties = { margin: '20px 0 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' };

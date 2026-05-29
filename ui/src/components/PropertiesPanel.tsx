import React, { useEffect, useState } from 'react';
import { FileInfo, Workspace, ExportPreset } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';
import { BackupsPanel } from './BackupsPanel';

const DEFAULT_PRESETS: ExportPreset[] = [
  { id: 'png', label: 'PNG (image)', format: 'png', scale: 1, background: true, darkMode: false, nameTemplate: '{name}' },
  { id: 'svg', label: 'SVG (vector)', format: 'svg', scale: 1, background: true, darkMode: false, nameTemplate: '{name}' },
  { id: 'json', label: 'Excalidraw (.json)', format: 'json', scale: 1, background: false, darkMode: false, nameTemplate: '{name}' },
];

export const PropertiesPanel: React.FC<{
  activeFile: FileInfo | null;
  activeWorkspace: Workspace | null;
  presets: ExportPreset[];
  onExport: (preset: ExportPreset) => Promise<void>;
}> = ({ activeFile, activeWorkspace, presets, onExport }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const relKey = activeFile && activeWorkspace
    ? activeFile.path.slice(activeWorkspace.path.length + 1)
    : null;

  useEffect(() => {
    (async () => {
      if (!activeWorkspace || !relKey) {
        setTags([]);
        return;
      }
      const all = await window.api.workspaces.getTags(activeWorkspace.id);
      setTags(all[relKey] || []);
    })();
  }, [activeWorkspace?.id, relKey]);

  const commitTags = async (next: string[]) => {
    if (!activeWorkspace || !activeFile) return;
    setTags(next);
    await window.api.workspaces.setTags(activeWorkspace.id, activeFile.path, next);
  };

  const addTag = () => {
    const t = draft.trim();
    if (t && !tags.includes(t)) commitTags([...tags, t]);
    setDraft('');
  };

  const doExport = async (preset: ExportPreset) => {
    setExporting(preset.id);
    try {
      await onExport(preset);
      toastSuccess(`Exported as ${preset.format.toUpperCase()}`);
    } catch (e: any) {
      toastError(e?.message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const effectivePresets = presets.length ? presets : DEFAULT_PRESETS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-lg)' }}>
      <section>
        <h4 style={sectionTitle}>File</h4>
        {activeFile ? (
          <div style={{ fontSize: '12px', color: 'var(--text-1)', wordBreak: 'break-all' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-0)' }}>{activeFile.name}</div>
            <div style={{ color: 'var(--text-2)', marginTop: 4 }}>
              {activeFile.extension || 'unknown'} · {(activeFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>No file open.</p>
        )}
      </section>

      {activeFile && (
        <section>
          <h4 style={sectionTitle}>Tags</h4>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map((t) => (
              <span key={t} className="chip">
                {t}
                <button
                  onClick={() => commitTags(tags.filter((x) => x !== t))}
                  style={{ background: 'none', padding: 0, color: 'inherit', marginLeft: 2 }}
                >
                  ×
                </button>
              </span>
            ))}
            {tags.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>No tags</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag…"
              style={{ flex: 1 }}
            />
            <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={addTag}>
              Add
            </button>
          </div>
        </section>
      )}

      <section>
        <h4 style={sectionTitle}>Export</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {effectivePresets.map((p) => (
            <button
              key={p.id}
              className="btn-ghost"
              disabled={!activeWorkspace || exporting !== null}
              onClick={() => doExport(p)}
              style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '12px' }}
            >
              {exporting === p.id ? 'Exporting…' : `↓ ${p.label}`}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: 6 }}>
          Exports are written to <code>&lt;workspace&gt;/exports/</code> with the scene embedded.
        </p>
      </section>

      {activeFile && <BackupsPanel activeFile={activeFile} />}
    </div>
  );
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '11px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--text-2)',
};

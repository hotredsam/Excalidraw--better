import React, { useEffect, useState } from 'react';
import { useApi } from '../api/ApiContext';
import type { StylePreset } from '@excalibur/shared';
import { toastSuccess } from '../lib/toast';

/** Save and apply reusable element-style presets (stroke/fill/etc.). */
export const StylePresetsPanel: React.FC<{
  onApply: (preset: StylePreset) => void;
  onSaveCurrent: () => Promise<void>;
  refreshKey?: number;
}> = ({ onApply, onSaveCurrent, refreshKey }) => {
  const api = useApi();
  const [presets, setPresets] = useState<StylePreset[]>([]);

  const refresh = async () => setPresets((await api.styles.list()).presets);
  useEffect(() => {
    refresh();
  }, [refreshKey]);

  const remove = async (id: string) => {
    await api.styles.remove(id);
    refresh();
  };

  const save = async () => {
    await onSaveCurrent();
    await refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={save}>
        + Save current style
      </button>
      {presets.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          No style presets yet. Set up a stroke/fill on the canvas, then save it for reuse.
        </p>
      )}
      {presets.map((p) => (
        <div
          key={p.id}
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-0)', borderRadius: 'var(--r-md)', padding: '8px 10px' }}
        >
          <span
            title="stroke"
            style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${p.strokeColor}`, background: p.backgroundColor === 'transparent' ? 'transparent' : p.backgroundColor, flexShrink: 0 }}
          />
          <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
          <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { onApply(p); toastSuccess(`Applied "${p.name}"`); }}>
            Apply
          </button>
          <button onClick={() => remove(p.id)} style={{ background: 'transparent', color: 'var(--danger)', fontSize: 12 }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

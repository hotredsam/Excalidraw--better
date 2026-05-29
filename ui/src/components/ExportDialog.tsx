import React, { useState } from 'react';
import type { ExportPreset } from '@excalibur/shared';

/** Export with adjustable options (format, scale, background). */
export const ExportDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onExport: (preset: ExportPreset) => Promise<void>;
  baseName: string;
}> = ({ open, onClose, onExport, baseName }) => {
  const [format, setFormat] = useState<'png' | 'svg' | 'json'>('png');
  const [scale, setScale] = useState(1);
  const [background, setBackground] = useState(true);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const run = async () => {
    setBusy(true);
    try {
      await onExport({
        id: `custom-${format}`,
        label: `${format.toUpperCase()} @${scale}x`,
        format,
        scale,
        background,
        darkMode: false,
        nameTemplate: '{name}',
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, color: 'var(--orange-600)' }}>Export “{baseName}”</h2>

        <label style={row}>
          <span>Format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
            <option value="png">PNG (raster)</option>
            <option value="svg">SVG (vector)</option>
            <option value="json">Excalidraw (.json)</option>
          </select>
        </label>

        {format === 'png' && (
          <label style={row}>
            <span>Scale</span>
            <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={3}>3x (print)</option>
            </select>
          </label>
        )}

        {format !== 'json' && (
          <label style={row}>
            <span>Include background</span>
            <input type="checkbox" checked={background} onChange={(e) => setBackground(e.target.checked)} />
          </label>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
          Saved to <code>&lt;workspace&gt;/exports/</code> with the scene embedded.
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 'var(--s-lg)' }}>
          <button className="btn-primary" style={{ flex: 1 }} disabled={busy} onClick={run}>
            {busy ? 'Exporting…' : 'Export'}
          </button>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
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
  zIndex: 2200,
};
const modal: React.CSSProperties = {
  width: 380,
  backgroundColor: 'var(--bg-1)',
  borderRadius: 'var(--r-lg)',
  border: '1px solid var(--border-0)',
  padding: 'var(--s-xl)',
};
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--s-md)',
  fontSize: 13,
};

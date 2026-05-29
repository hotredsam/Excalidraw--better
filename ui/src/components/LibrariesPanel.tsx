import React, { useEffect, useState } from 'react';
import { LibrarySummary } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

export const LibrariesPanel: React.FC<{
  onInsertLibrary?: (id: string) => void;
  onSaveSelection?: (id: string) => void;
  refreshKey?: number;
}> = ({ onInsertLibrary, onSaveSelection, refreshKey }) => {
  const [libraries, setLibraries] = useState<LibrarySummary[]>([]);

  const refresh = async () => setLibraries((await window.api.libraries.list()).libraries);
  useEffect(() => {
    refresh();
  }, [refreshKey]);

  const importLib = async () => {
    try {
      const summary = await window.api.libraries.import();
      if (summary) {
        toastSuccess(`Imported library "${summary.name}"`);
        refresh();
      }
    } catch (e: any) {
      toastError(e?.message || 'Import failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm(`Remove library "${id}"?`)) return;
    await window.api.libraries.remove(id);
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={importLib}>
        + Import .excalidrawlib
      </button>
      {libraries.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>No libraries yet. Import a pack or save a selection.</p>
      )}
      {libraries.map((lib) => (
        <div
          key={lib.id}
          style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-0)', borderRadius: 'var(--r-md)', padding: 'var(--s-md)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 13 }}>{lib.name}</strong>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{lib.itemCount} items</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {onInsertLibrary && (
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => onInsertLibrary(lib.id)}>
                Insert items
              </button>
            )}
            {onSaveSelection && (
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => onSaveSelection(lib.id)}>
                + Save selection
              </button>
            )}
            <button style={{ background: 'transparent', color: 'var(--danger)', fontSize: 11, padding: 0 }} onClick={() => remove(lib.id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

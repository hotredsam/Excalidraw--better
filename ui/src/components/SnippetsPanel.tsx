import React, { useEffect, useState } from 'react';
import { useApi } from '../api/ApiContext';
import { SnippetSummary } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

export const SnippetsPanel: React.FC<{
  onInsert: (id: string) => void;
  onSaveSelection: () => Promise<{ title: string; elements: any[] } | null>;
  refreshKey?: number;
}> = ({ onInsert, onSaveSelection, refreshKey }) => {
  const api = useApi();
  const [snippets, setSnippets] = useState<SnippetSummary[]>([]);

  const refresh = async () => setSnippets((await api.snippets.list()).snippets);
  useEffect(() => {
    refresh();
  }, [refreshKey]);

  const saveCurrent = async () => {
    const data = await onSaveSelection();
    if (!data) return;
    if (!data.elements.length) return toastError('Select some elements first.');
    await api.snippets.save({ title: data.title, elements: data.elements });
    toastSuccess(`Saved snippet "${data.title}"`);
    refresh();
  };

  const remove = async (id: string) => {
    await api.snippets.remove(id);
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={saveCurrent}>
        + Save selection as snippet
      </button>
      {snippets.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          No snippets yet. Select elements on the canvas and save them for quick reuse.
        </p>
      )}
      {snippets.map((s) => (
        <div
          key={s.id}
          style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-0)', borderRadius: 'var(--r-md)', padding: 'var(--s-md)' }}
        >
          <strong style={{ fontSize: 13 }}>{s.title}</strong>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
            {s.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => onInsert(s.id)}>
              Insert
            </button>
            <button style={{ background: 'transparent', color: 'var(--danger)', fontSize: 11, padding: 0 }} onClick={() => remove(s.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

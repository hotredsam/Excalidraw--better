import React, { useEffect, useState } from 'react';
import { useApi } from '../api/ApiContext';
import { RecentFile } from '@excalibur/shared';

export const RecentsPanel: React.FC<{
  onOpenRecent: (r: RecentFile) => void;
  refreshKey?: number;
}> = ({ onOpenRecent, refreshKey }) => {
  const api = useApi();
  const [recents, setRecents] = useState<RecentFile[]>([]);

  const refresh = async () => setRecents((await api.recents.list()).recents);
  useEffect(() => {
    refresh();
  }, [refreshKey]);

  const fmt = (t: number) => new Date(t).toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)' }}>{recents.length} recent file(s)</p>
        <button
          className="btn-ghost"
          style={{ fontSize: 11 }}
          onClick={async () => {
            await api.recents.clear();
            refresh();
          }}
        >
          Clear
        </button>
      </div>
      {recents.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-2)' }}>No recent files yet.</p>}
      {recents.map((r) => (
        <div
          key={r.path}
          onClick={() => onOpenRecent(r)}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border-0)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {r.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {r.workspaceName} · {fmt(r.openedAt)}
          </div>
        </div>
      ))}
    </div>
  );
};

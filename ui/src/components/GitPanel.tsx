import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../api/ApiContext';
import { Workspace, GitStatus } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

export const GitPanel: React.FC<{ activeWorkspace: Workspace | null }> = ({ activeWorkspace }) => {
  const api = useApi();
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [log, setLog] = useState<{ hash: string; subject: string; date: string }[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!activeWorkspace) return;
    const st = await api.git.status(activeWorkspace.id);
    setStatus(st);
    if (st.isRepo) setLog((await api.git.log(activeWorkspace.id, 10)).entries);
  }, [activeWorkspace?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!activeWorkspace) return <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Open a workspace.</p>;
  if (!status) return <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Checking…</p>;

  if (!status.isRepo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>This workspace is not a git repository.</p>
        <button
          className="btn-ghost"
          style={{ fontSize: 12 }}
          onClick={async () => {
            await api.git.init(activeWorkspace.id);
            refresh();
          }}
        >
          git init
        </button>
      </div>
    );
  }

  const commit = async () => {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const res = await api.git.commit(activeWorkspace.id, message);
      toastSuccess('Committed: ' + res.output.split('\n')[0]);
      setMessage('');
      refresh();
    } catch (e: any) {
      toastError(e?.message || 'Commit failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-1)' }}>
        On <strong>{status.branch}</strong>
        {status.ahead ? <span className="chip" style={{ marginLeft: 6 }}>↑{status.ahead}</span> : null}
        {status.behind ? <span className="chip" style={{ marginLeft: 6 }}>↓{status.behind}</span> : null}
      </div>

      <section>
        <h4 style={title}>Changes ({status.files.length})</h4>
        {status.clean && <p style={{ fontSize: 12, color: 'var(--success)' }}>Working tree clean ✓</p>}
        {status.files.slice(0, 30).map((f) => (
          <div key={f.path} style={{ fontSize: 12, display: 'flex', gap: 8, padding: '1px 0' }}>
            <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--warning)', width: 22 }}>
              {(f.index || ' ') + (f.working || ' ')}
            </span>
            <span style={{ color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path}</span>
          </div>
        ))}
      </section>

      {!status.clean && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Commit message…" />
          <button className="btn-primary" disabled={busy || !message.trim()} onClick={commit}>
            Commit all changes
          </button>
        </div>
      )}

      <section>
        <h4 style={title}>Recent commits</h4>
        {log.map((c) => (
          <div key={c.hash} style={{ fontSize: 12, padding: '2px 0' }}>
            <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--orange-500)' }}>{c.hash}</span>{' '}
            <span style={{ color: 'var(--text-1)' }}>{c.subject}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

const title: React.CSSProperties = { margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)' };

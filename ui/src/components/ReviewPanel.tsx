import React, { useEffect, useState, useCallback } from 'react';
import { Workspace, FileInfo, Review } from '@excalibur/shared';
import { toastError } from '../lib/toast';

export const ReviewPanel: React.FC<{
  activeWorkspace: Workspace | null;
  activeFile: FileInfo | null;
  author: string;
}> = ({ activeWorkspace, activeFile, author }) => {
  const [review, setReview] = useState<Review>({ pins: [] });
  const [draft, setDraft] = useState('');

  const refresh = useCallback(async () => {
    if (!activeWorkspace || !activeFile) {
      setReview({ pins: [] });
      return;
    }
    try {
      setReview(await window.api.review.get(activeWorkspace.id, activeFile.path));
    } catch {
      setReview({ pins: [] });
    }
  }, [activeWorkspace?.id, activeFile?.path]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!activeFile || !activeWorkspace) {
    return <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Open a drawing to leave review comments.</p>;
  }

  const addPin = async () => {
    if (!draft.trim()) return;
    try {
      setReview(await window.api.review.addPin(activeWorkspace.id, activeFile.path, 0, 0, author, draft.trim()));
      setDraft('');
    } catch (e: any) {
      toastError(e?.message || 'Could not add comment');
    }
  };

  const comment = async (pinId: string) => {
    const body = prompt('Reply:');
    if (!body) return;
    setReview(await window.api.review.addComment(activeWorkspace.id, activeFile.path, pinId, author, body));
  };

  const open = review.pins.filter((p) => !p.resolved);
  const resolved = review.pins.filter((p) => p.resolved);

  const PinCard = ({ pin }: { pin: Review['pins'][number] }) => (
    <div style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-0)', borderRadius: 'var(--r-md)', padding: 'var(--s-md)', opacity: pin.resolved ? 0.6 : 1 }}>
      {pin.comments.map((c) => (
        <div key={c.id} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--orange-500)', fontWeight: 600 }}>{c.author}</div>
          <div style={{ fontSize: 12, color: 'var(--text-1)' }}>{c.body}</div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button style={mini} onClick={() => comment(pin.id)}>Reply</button>
        <button style={mini} onClick={async () => setReview(await window.api.review.setResolved(activeWorkspace.id, activeFile.path, pin.id, !pin.resolved))}>
          {pin.resolved ? 'Reopen' : 'Resolve'}
        </button>
        <button style={{ ...mini, color: 'var(--danger)' }} onClick={async () => setReview(await window.api.review.deletePin(activeWorkspace.id, activeFile.path, pin.id))}>
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a review comment…" style={{ minHeight: 60, resize: 'vertical' }} />
        <button className="btn-primary" disabled={!draft.trim()} onClick={addPin}>
          Add comment
        </button>
      </div>

      <h4 style={title}>Open ({open.length})</h4>
      {open.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-2)' }}>No open comments.</p>}
      {open.map((p) => <PinCard key={p.id} pin={p} />)}

      {resolved.length > 0 && (
        <>
          <h4 style={title}>Resolved ({resolved.length})</h4>
          {resolved.map((p) => <PinCard key={p.id} pin={p} />)}
        </>
      )}
    </div>
  );
};

const title: React.CSSProperties = { margin: '4px 0 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)' };
const mini: React.CSSProperties = { background: 'transparent', color: 'var(--text-2)', fontSize: 11, padding: 0 };

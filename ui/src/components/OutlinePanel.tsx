import React, { useEffect, useState } from 'react';
import { Workspace, FileInfo, SlideDeck } from '@excalibur/shared';

/**
 * Document outline: lists the frames in the current drawing (the same ordering
 * used by Presentation mode). Selecting an entry scrolls the canvas to it.
 */
export const OutlinePanel: React.FC<{
  activeWorkspace: Workspace | null;
  activeFile: FileInfo | null;
  getScene: () => any;
  onGoTo: (slideId: string) => void;
  refreshKey?: number;
}> = ({ activeWorkspace, activeFile, getScene, onGoTo, refreshKey }) => {
  const [deck, setDeck] = useState<SlideDeck>({ slides: [] });

  const refresh = async () => {
    const wsId = activeWorkspace?.id;
    if (!wsId) {
      setDeck({ slides: [] });
      return;
    }
    setDeck(await window.api.presentation.getDeck(wsId, activeFile?.path || 'scratch', getScene()));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.path, refreshKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)' }}>
          {deck.slides.length} frame{deck.slides.length === 1 ? '' : 's'}
        </p>
        <button className="btn-ghost" style={{ fontSize: 11 }} onClick={refresh}>
          Refresh
        </button>
      </div>
      {deck.slides.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Add frames to your drawing to build an outline and a slide deck.
        </p>
      )}
      {deck.slides.map((s) => (
        <div
          key={s.id}
          onClick={() => onGoTo(s.id)}
          style={{ padding: '6px 8px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: 13, color: 'var(--text-1)', display: 'flex', gap: 8 }}
        >
          <span style={{ color: 'var(--text-2)', width: 18 }}>{s.index + 1}.</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
};

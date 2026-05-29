import React, { useEffect } from 'react';
import { SlideDeck } from '@excalibur/shared';

export const PresentationMode: React.FC<{
  deck: SlideDeck;
  index: number;
  onIndex: (i: number) => void;
  onExit: () => void;
}> = ({ deck, index, onIndex, onExit }) => {
  const slide = deck.slides[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      else if (e.key === 'ArrowRight' || e.key === ' ') onIndex(Math.min(index + 1, deck.slides.length - 1));
      else if (e.key === 'ArrowLeft') onIndex(Math.max(index - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, deck.slides.length, onIndex, onExit]);

  if (!slide) {
    return (
      <div style={overlay}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-1)' }}>No frames found. Add frames to your drawing to build a slide deck.</p>
          <button className="btn-primary" onClick={onExit}>Exit</button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>
          {index + 1} / {deck.slides.length}
        </span>
        <button className="btn-ghost" onClick={onExit}>Exit (Esc)</button>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 720 }}>
        <div style={{ fontSize: 12, color: 'var(--orange-500)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Slide {index + 1}
        </div>
        <h1 style={{ fontSize: 40, margin: '12px 0', color: 'var(--text-0)' }}>{slide.name}</h1>
        {slide.notes && (
          <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: 'var(--r-lg)', padding: 'var(--s-xl)', color: 'var(--text-1)', fontSize: 16, lineHeight: 1.6, textAlign: 'left' }}>
            {slide.notes}
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 28, display: 'flex', gap: 12 }}>
        <button className="btn-ghost" disabled={index === 0} onClick={() => onIndex(index - 1)}>← Prev</button>
        <button className="btn-primary" disabled={index >= deck.slides.length - 1} onClick={() => onIndex(index + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 6000,
  backgroundColor: 'rgba(11,13,18,0.97)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
};

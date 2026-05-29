import React, { useEffect, useState } from 'react';
import type { Command } from '@excalibur/shared';

/** A '?'-triggered cheat-sheet of all commands that have an effective shortcut. */
export const KeyboardHelpOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [rows, setRows] = useState<{ title: string; category: string; acc: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [{ commands }, { bindings }] = await Promise.all([
        window.api.commands.list(),
        window.api.shortcuts.list(),
      ]);
      const overrideFor = (id: string) => bindings.find((b) => b.commandId === id)?.accelerator;
      const list = (commands as Command[])
        .map((c) => ({ title: c.title, category: c.category, acc: overrideFor(c.id) ?? c.accelerator ?? '' }))
        .filter((r) => r.acc);
      setRows(list);
    })();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const byCategory = rows.reduce<Record<string, typeof rows>>((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 4500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 92vw)', maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-1)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-lg)', padding: 'var(--s-xl)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--orange-600)' }}>Keyboard shortcuts</h2>
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)' }}>{cat}</h4>
            {items.map((r) => (
              <div key={r.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--text-1)' }}>{r.title}</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'var(--text-2)' }}>{r.acc}</span>
              </div>
            ))}
          </div>
        ))}
        <button onClick={onClose} className="btn-ghost" style={{ width: '100%' }}>Close (Esc)</button>
      </div>
    </div>
  );
};

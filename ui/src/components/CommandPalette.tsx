import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Command } from '@excalibur/shared';
import { filterCommands } from '../lib/commands';

export const CommandPalette: React.FC<{
  open: boolean;
  onClose: () => void;
  onRun: (id: string) => void;
}> = ({ open, onClose, onRun }) => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.api.commands.list().then((r) => setCommands(r.commands));
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => filterCommands(commands, query), [commands, query]);

  useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered.length, active]);

  if (!open) return null;

  const run = (cmd?: Command) => {
    if (!cmd) return;
    onRun(cmd.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 4000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(620px, 92vw)',
          backgroundColor: 'var(--bg-2)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-2)',
          overflow: 'hidden',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              run(filtered[active]);
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="Type a command…"
          style={{ width: '100%', border: 'none', borderRadius: 0, fontSize: 15, padding: '16px 18px' }}
        />
        <div style={{ maxHeight: 360, overflowY: 'auto', borderTop: '1px solid var(--border-0)' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 18, color: 'var(--text-2)', fontSize: 13 }}>No matching commands.</div>
          )}
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(cmd)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 18px',
                cursor: 'pointer',
                backgroundColor: i === active ? 'var(--bg-3)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--text-2)', marginRight: 8 }}>{cmd.category}</span>
                {cmd.title}
              </span>
              {cmd.accelerator && (
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'ui-monospace, monospace' }}>
                  {cmd.accelerator}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import type { Command, ShortcutBinding } from '@excalibur/shared';
import { normalizeAccelerator } from '../lib/shortcuts';
import { toastError } from '../lib/toast';

/**
 * Keyboard-shortcut customization. Lists commands that have a default
 * accelerator, shows the effective binding (override ?? default), and lets the
 * user re-bind by pressing a key combination.
 */
export const ShortcutsEditor: React.FC = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [overrides, setOverrides] = useState<ShortcutBinding[]>([]);
  const [capturing, setCapturing] = useState<string | null>(null);

  const load = async () => {
    const [{ commands }, { bindings }] = await Promise.all([
      window.api.commands.list(),
      window.api.shortcuts.list(),
    ]);
    setCommands(commands);
    setOverrides(bindings);
  };

  useEffect(() => {
    load();
  }, []);

  const resolved: Record<string, string> = {};
  for (const c of commands) {
    const e = overrides.find((b) => b.commandId === c.id)?.accelerator ?? c.accelerator;
    if (e) resolved[c.id] = e;
  }
  const bindable = commands.filter((c) => resolved[c.id]);

  const onCapture = async (commandId: string, e: React.KeyboardEvent) => {
    e.preventDefault();
    const acc = normalizeAccelerator({
      key: e.key,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
    });
    if (['Ctrl', 'Alt', 'Shift', ''].includes(acc)) return;
    try {
      const { bindings } = await window.api.shortcuts.set(commandId, acc);
      setOverrides(bindings);
      setCapturing(null);
    } catch (err: any) {
      toastError(err?.message || 'Could not bind');
    }
  };

  const resetOne = async (commandId: string) => {
    const { bindings } = await window.api.shortcuts.reset(commandId);
    setOverrides(bindings);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {bindable.map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{c.title}</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              tabIndex={0}
              onKeyDown={(e) => capturing === c.id && onCapture(c.id, e)}
              onClick={() => setCapturing(c.id)}
              onBlur={() => setCapturing((cur) => (cur === c.id ? null : cur))}
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 'var(--r-sm)',
                background: capturing === c.id ? 'var(--orange-600)' : 'rgba(255,255,255,0.08)',
                color: capturing === c.id ? '#0b0d12' : 'var(--text-0)',
                minWidth: 90,
              }}
            >
              {capturing === c.id ? 'Press keys…' : resolved[c.id]}
            </button>
            {overrides.find((b) => b.commandId === c.id) && (
              <button onClick={() => resetOne(c.id)} title="Reset to default" style={{ background: 'transparent', color: 'var(--text-2)', fontSize: 11, padding: 2 }}>
                ↺
              </button>
            )}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 8 }}>
        Click a binding then press the new combination. Conflicts are rejected.
      </p>
    </div>
  );
};

import { ShortcutBinding, DEFAULT_SHORTCUTS } from './features2';

/**
 * Normalize a keyboard event into a canonical accelerator string like
 * "Ctrl+Shift+P". Modifier order is fixed (Ctrl, Alt, Shift, Meta) and the key
 * is upper-cased for letters / mapped for special keys.
 */
export interface KeyEventLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

const KEY_ALIASES: Record<string, string> = {
  ' ': 'Space',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Escape: 'Esc',
};

export function normalizeAccelerator(e: KeyEventLike): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  let key = e.key;
  if (KEY_ALIASES[key]) key = KEY_ALIASES[key];
  else if (key.length === 1) key = key.toUpperCase();
  // Don't emit a lone modifier as the key.
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return parts.join('+');
  parts.push(key);
  return parts.join('+');
}

/** Build a command→accelerator lookup, applying user overrides over defaults. */
export function resolveShortcuts(overrides: ShortcutBinding[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const b of DEFAULT_SHORTCUTS) map[b.commandId] = b.accelerator;
  for (const b of overrides) map[b.commandId] = b.accelerator;
  return map;
}

/** Reverse lookup: accelerator → commandId (last binding wins on conflict). */
export function acceleratorToCommand(overrides: ShortcutBinding[]): Record<string, string> {
  const resolved = resolveShortcuts(overrides);
  const rev: Record<string, string> = {};
  for (const [cmd, acc] of Object.entries(resolved)) rev[acc] = cmd;
  return rev;
}

/** Detect a conflicting binding (same accelerator already used by another command). */
export function findShortcutConflict(
  overrides: ShortcutBinding[],
  commandId: string,
  accelerator: string,
): string | null {
  const resolved = resolveShortcuts(overrides);
  for (const [cmd, acc] of Object.entries(resolved)) {
    if (cmd !== commandId && acc === accelerator) return cmd;
  }
  return null;
}

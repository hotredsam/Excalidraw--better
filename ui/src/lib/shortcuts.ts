/**
 * Local mirror of `feature-utils2.normalizeAccelerator` (kept in the renderer to
 * avoid pulling runtime helpers across the CommonJS `@excalibur/shared`
 * boundary). Behaviour is covered by the shared unit tests.
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
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return parts.join('+');
  parts.push(key);
  return parts.join('+');
}

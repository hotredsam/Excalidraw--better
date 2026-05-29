import { DEFAULT_SHORTCUTS } from './features2';
const KEY_ALIASES = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Esc',
};
export function normalizeAccelerator(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey)
        parts.push('Ctrl');
    if (e.altKey)
        parts.push('Alt');
    if (e.shiftKey)
        parts.push('Shift');
    let key = e.key;
    if (KEY_ALIASES[key])
        key = KEY_ALIASES[key];
    else if (key.length === 1)
        key = key.toUpperCase();
    // Don't emit a lone modifier as the key.
    if (['Control', 'Meta', 'Alt', 'Shift'].includes(key))
        return parts.join('+');
    parts.push(key);
    return parts.join('+');
}
/** Build a command→accelerator lookup, applying user overrides over defaults. */
export function resolveShortcuts(overrides) {
    const map = {};
    for (const b of DEFAULT_SHORTCUTS)
        map[b.commandId] = b.accelerator;
    for (const b of overrides)
        map[b.commandId] = b.accelerator;
    return map;
}
/** Reverse lookup: accelerator → commandId (last binding wins on conflict). */
export function acceleratorToCommand(overrides) {
    const resolved = resolveShortcuts(overrides);
    const rev = {};
    for (const [cmd, acc] of Object.entries(resolved))
        rev[acc] = cmd;
    return rev;
}
/** Detect a conflicting binding (same accelerator already used by another command). */
export function findShortcutConflict(overrides, commandId, accelerator) {
    const resolved = resolveShortcuts(overrides);
    for (const [cmd, acc] of Object.entries(resolved)) {
        if (cmd !== commandId && acc === accelerator)
            return cmd;
    }
    return null;
}

import { ShortcutBinding } from './features2';
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
export declare function normalizeAccelerator(e: KeyEventLike): string;
/** Build a command→accelerator lookup, applying user overrides over defaults. */
export declare function resolveShortcuts(overrides: ShortcutBinding[]): Record<string, string>;
/** Reverse lookup: accelerator → commandId (last binding wins on conflict). */
export declare function acceleratorToCommand(overrides: ShortcutBinding[]): Record<string, string>;
/** Detect a conflicting binding (same accelerator already used by another command). */
export declare function findShortcutConflict(overrides: ShortcutBinding[], commandId: string, accelerator: string): string | null;

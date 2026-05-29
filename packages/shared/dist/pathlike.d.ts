/**
 * Pure, POSIX-style path string helpers. Unlike Node's `path`, these are safe to
 * use anywhere (renderer included) and operate purely on `/`-separated strings —
 * handy for display and workspace-relative computations.
 */
export declare function normalizeSlashes(p: string): string;
export declare function basename(p: string): string;
export declare function dirname(p: string): string;
export declare function extname(p: string): string;
export declare function stripExt(p: string): string;
export declare function joinSegments(...segments: string[]): string;
/** Path of `target` relative to `base` (both absolute, same root). */
export declare function relativeTo(base: string, target: string): string;
export declare function segments(p: string): string[];
export declare function depth(p: string): number;

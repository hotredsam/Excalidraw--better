/**
 * Pure, POSIX-style path string helpers. Unlike Node's `path`, these are safe to
 * use anywhere (renderer included) and operate purely on `/`-separated strings —
 * handy for display and workspace-relative computations.
 */

export function normalizeSlashes(p: string): string {
  return p.replace(/\\/g, '/');
}

export function basename(p: string): string {
  const n = normalizeSlashes(p).replace(/\/+$/, '');
  const idx = n.lastIndexOf('/');
  return idx === -1 ? n : n.slice(idx + 1);
}

export function dirname(p: string): string {
  const n = normalizeSlashes(p).replace(/\/+$/, '');
  const idx = n.lastIndexOf('/');
  if (idx === -1) return '.';
  return idx === 0 ? '/' : n.slice(0, idx);
}

export function extname(p: string): string {
  const base = basename(p);
  const idx = base.lastIndexOf('.');
  return idx <= 0 ? '' : base.slice(idx);
}

export function stripExt(p: string): string {
  const ext = extname(p);
  return ext ? p.slice(0, p.length - ext.length) : p;
}

export function joinSegments(...segments: string[]): string {
  return segments
    .map((s) => normalizeSlashes(s))
    .filter(Boolean)
    .join('/')
    .replace(/\/{2,}/g, '/');
}

/** Path of `target` relative to `base` (both absolute, same root). */
export function relativeTo(base: string, target: string): string {
  const b = normalizeSlashes(base).replace(/\/+$/, '');
  const t = normalizeSlashes(target);
  if (t === b) return '';
  if (t.startsWith(b + '/')) return t.slice(b.length + 1);
  return t;
}

export function segments(p: string): string[] {
  return normalizeSlashes(p).split('/').filter(Boolean);
}

export function depth(p: string): number {
  return segments(p).length;
}

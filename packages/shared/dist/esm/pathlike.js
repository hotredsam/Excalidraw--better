/**
 * Pure, POSIX-style path string helpers. Unlike Node's `path`, these are safe to
 * use anywhere (renderer included) and operate purely on `/`-separated strings —
 * handy for display and workspace-relative computations.
 */
export function normalizeSlashes(p) {
    return p.replace(/\\/g, '/');
}
export function basename(p) {
    const n = normalizeSlashes(p).replace(/\/+$/, '');
    const idx = n.lastIndexOf('/');
    return idx === -1 ? n : n.slice(idx + 1);
}
export function dirname(p) {
    const n = normalizeSlashes(p).replace(/\/+$/, '');
    const idx = n.lastIndexOf('/');
    if (idx === -1)
        return '.';
    return idx === 0 ? '/' : n.slice(0, idx);
}
export function extname(p) {
    const base = basename(p);
    const idx = base.lastIndexOf('.');
    return idx <= 0 ? '' : base.slice(idx);
}
export function stripExt(p) {
    const ext = extname(p);
    return ext ? p.slice(0, p.length - ext.length) : p;
}
export function joinSegments(...segments) {
    return segments
        .map((s) => normalizeSlashes(s))
        .filter(Boolean)
        .join('/')
        .replace(/\/{2,}/g, '/');
}
/** Path of `target` relative to `base` (both absolute, same root). */
export function relativeTo(base, target) {
    const b = normalizeSlashes(base).replace(/\/+$/, '');
    const t = normalizeSlashes(target);
    if (t === b)
        return '';
    if (t.startsWith(b + '/'))
        return t.slice(b.length + 1);
    return t;
}
export function segments(p) {
    return normalizeSlashes(p).split('/').filter(Boolean);
}
export function depth(p) {
    return segments(p).length;
}

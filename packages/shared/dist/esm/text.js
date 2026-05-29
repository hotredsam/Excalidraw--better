/** Additional pure text helpers (kept separate from utils.ts for clarity). */
export function pluralize(count, singular, plural = singular + 's') {
    return `${count} ${count === 1 ? singular : plural}`;
}
export function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
/** Truncate the middle of a long string (e.g. a path), keeping both ends. */
export function middleTruncate(input, max) {
    if (input.length <= max)
        return input;
    if (max <= 1)
        return '…';
    const keep = max - 1;
    const head = Math.ceil(keep / 2);
    const tail = Math.floor(keep / 2);
    return input.slice(0, head) + '…' + input.slice(input.length - tail);
}
/** Split a filename into base name and extension (extension includes the dot). */
export function parseFilename(name) {
    const idx = name.lastIndexOf('.');
    if (idx <= 0)
        return { base: name, ext: '' };
    return { base: name.slice(0, idx), ext: name.slice(idx) };
}
/** Turn a camelCase / snake_case key into a human label. */
export function humanizeKey(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
}
export function pad2(n) {
    return String(n).padStart(2, '0');
}
/** ISO-ish local date YYYY-MM-DD. */
export function isoDate(d = new Date()) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function countWords(text) {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
}

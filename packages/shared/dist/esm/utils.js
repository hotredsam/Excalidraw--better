/**
 * Small, dependency-free utility helpers shared by the main and renderer
 * processes. Pure functions only — easy to unit test.
 */
export function formatBytes(bytes, decimals = 1) {
    if (!Number.isFinite(bytes) || bytes <= 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}
export function formatRelativeTime(ts, now = Date.now()) {
    const diff = Math.max(0, now - ts);
    const sec = Math.floor(diff / 1000);
    if (sec < 60)
        return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60)
        return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24)
        return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7)
        return `${day}d ago`;
    const wk = Math.floor(day / 7);
    if (wk < 5)
        return `${wk}w ago`;
    const mo = Math.floor(day / 30);
    if (mo < 12)
        return `${mo}mo ago`;
    return `${Math.floor(day / 365)}y ago`;
}
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export function slugify(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'untitled';
}
export function groupBy(items, key) {
    const out = {};
    for (const item of items) {
        const k = key(item);
        (out[k] ||= []).push(item);
    }
    return out;
}
export function uniqueBy(items, key) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
        const k = key(item);
        if (!seen.has(k)) {
            seen.add(k);
            out.push(item);
        }
    }
    return out;
}
/**
 * Shallow diff of two flat-ish objects. Returns the keys whose JSON-serialized
 * values differ (added / removed / changed). Used to preview settings bundles
 * before applying them.
 */
export function diffObjects(before, after) {
    const keys = uniqueBy([...Object.keys(before || {}), ...Object.keys(after || {})], (k) => k);
    const changes = [];
    for (const key of keys) {
        const b = before?.[key];
        const a = after?.[key];
        if (JSON.stringify(b) !== JSON.stringify(a)) {
            changes.push({ key, before: b, after: a });
        }
    }
    return changes;
}
export function titleCase(input) {
    return input.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
export function truncate(input, max) {
    if (input.length <= max)
        return input;
    return input.slice(0, Math.max(0, max - 1)) + '…';
}

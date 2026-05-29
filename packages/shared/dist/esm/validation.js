/** Tiny validation / data-shaping helpers (pure, dependency-free). */
export function isHexColor(v) {
    return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}
export function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
export function isUrl(v) {
    try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch {
        return false;
    }
}
export function safeJsonParse(text, fallback = null) {
    try {
        return JSON.parse(text);
    }
    catch {
        return fallback;
    }
}
export function ensureArray(v) {
    if (v == null)
        return [];
    return Array.isArray(v) ? v : [v];
}
export function pick(obj, keys) {
    const out = {};
    for (const k of keys)
        if (k in obj)
            out[k] = obj[k];
    return out;
}
export function omit(obj, keys) {
    const set = new Set(keys);
    const out = {};
    for (const k of Object.keys(obj))
        if (!set.has(k))
            out[k] = obj[k];
    return out;
}
export function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}
export function coerceNumber(v, fallback = 0) {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
}

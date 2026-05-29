"use strict";
/** Tiny validation / data-shaping helpers (pure, dependency-free). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHexColor = isHexColor;
exports.isEmail = isEmail;
exports.isUrl = isUrl;
exports.safeJsonParse = safeJsonParse;
exports.ensureArray = ensureArray;
exports.pick = pick;
exports.omit = omit;
exports.isNonEmptyString = isNonEmptyString;
exports.coerceNumber = coerceNumber;
function isHexColor(v) {
    return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}
function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isUrl(v) {
    try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch {
        return false;
    }
}
function safeJsonParse(text, fallback = null) {
    try {
        return JSON.parse(text);
    }
    catch {
        return fallback;
    }
}
function ensureArray(v) {
    if (v == null)
        return [];
    return Array.isArray(v) ? v : [v];
}
function pick(obj, keys) {
    const out = {};
    for (const k of keys)
        if (k in obj)
            out[k] = obj[k];
    return out;
}
function omit(obj, keys) {
    const set = new Set(keys);
    const out = {};
    for (const k of Object.keys(obj))
        if (!set.has(k))
            out[k] = obj[k];
    return out;
}
function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}
function coerceNumber(v, fallback = 0) {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
}

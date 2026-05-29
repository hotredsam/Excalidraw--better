"use strict";
/**
 * Small color utilities (no dependencies) used for theming, palette chips and
 * contrast-aware text. All functions are pure and tested.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHex = parseHex;
exports.toHex = toHex;
exports.luminance = luminance;
exports.contrastRatio = contrastRatio;
exports.readableTextColor = readableTextColor;
exports.mix = mix;
exports.lighten = lighten;
exports.darken = darken;
exports.colorForString = colorForString;
exports.hslToHex = hslToHex;
/** Parse #rgb / #rrggbb (with or without leading #) into an RGB triple. */
function parseHex(hex) {
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3)
        h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 || /[^0-9a-fA-F]/.test(h))
        return null;
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
}
function toHex({ r, g, b }) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
}
/** Relative luminance per WCAG (0 = black, 1 = white). */
function luminance(rgb) {
    const ch = [rgb.r, rgb.g, rgb.b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
/** WCAG contrast ratio between two colors (1..21). */
function contrastRatio(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}
/** Pick black or white text for best contrast on a background hex. */
function readableTextColor(bgHex) {
    const rgb = parseHex(bgHex);
    if (!rgb)
        return '#ffffff';
    return contrastRatio(rgb, { r: 0, g: 0, b: 0 }) >= contrastRatio(rgb, { r: 255, g: 255, b: 255 })
        ? '#000000'
        : '#ffffff';
}
function mix(a, b, t) {
    const k = Math.max(0, Math.min(1, t));
    return { r: a.r + (b.r - a.r) * k, g: a.g + (b.g - a.g) * k, b: a.b + (b.b - a.b) * k };
}
function lighten(hex, amount) {
    const rgb = parseHex(hex);
    if (!rgb)
        return hex;
    return toHex(mix(rgb, { r: 255, g: 255, b: 255 }, amount));
}
function darken(hex, amount) {
    const rgb = parseHex(hex);
    if (!rgb)
        return hex;
    return toHex(mix(rgb, { r: 0, g: 0, b: 0 }, amount));
}
/** Deterministically derive a pleasant chip color from an arbitrary string. */
function colorForString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++)
        hash = (hash * 31 + input.charCodeAt(i)) | 0;
    const hue = Math.abs(hash) % 360;
    return hslToHex(hue, 60, 55);
}
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return toHex({ r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 });
}

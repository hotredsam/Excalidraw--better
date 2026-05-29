"use strict";
/**
 * Deterministic pseudo-random helpers (mulberry32). Useful for reproducible
 * layouts/sampling in tests and template generation. Not cryptographic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mulberry32 = mulberry32;
exports.hashSeed = hashSeed;
exports.randomInt = randomInt;
exports.pickRandom = pickRandom;
exports.shuffle = shuffle;
exports.shortId = shortId;
function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function hashSeed(input) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}
function pickRandom(rng, items) {
    if (items.length === 0)
        return undefined;
    return items[Math.floor(rng() * items.length)];
}
/** Fisher–Yates shuffle (returns a new array; deterministic given `rng`). */
function shuffle(rng, items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
/** A short, URL-safe id derived from a deterministic RNG. */
function shortId(rng, length = 8) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < length; i++)
        out += alphabet[Math.floor(rng() * alphabet.length)];
    return out;
}

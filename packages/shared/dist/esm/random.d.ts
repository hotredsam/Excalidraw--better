/**
 * Deterministic pseudo-random helpers (mulberry32). Useful for reproducible
 * layouts/sampling in tests and template generation. Not cryptographic.
 */
export declare function mulberry32(seed: number): () => number;
export declare function hashSeed(input: string): number;
export declare function randomInt(rng: () => number, min: number, max: number): number;
export declare function pickRandom<T>(rng: () => number, items: T[]): T | undefined;
/** Fisher–Yates shuffle (returns a new array; deterministic given `rng`). */
export declare function shuffle<T>(rng: () => number, items: T[]): T[];
/** A short, URL-safe id derived from a deterministic RNG. */
export declare function shortId(rng: () => number, length?: number): string;

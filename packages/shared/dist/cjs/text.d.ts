/** Additional pure text helpers (kept separate from utils.ts for clarity). */
export declare function pluralize(count: number, singular: string, plural?: string): string;
export declare function ordinal(n: number): string;
/** Truncate the middle of a long string (e.g. a path), keeping both ends. */
export declare function middleTruncate(input: string, max: number): string;
/** Split a filename into base name and extension (extension includes the dot). */
export declare function parseFilename(name: string): {
    base: string;
    ext: string;
};
/** Turn a camelCase / snake_case key into a human label. */
export declare function humanizeKey(key: string): string;
export declare function pad2(n: number): string;
/** ISO-ish local date YYYY-MM-DD. */
export declare function isoDate(d?: Date): string;
export declare function countWords(text: string): number;

/**
 * Small, dependency-free utility helpers shared by the main and renderer
 * processes. Pure functions only — easy to unit test.
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
export declare function formatRelativeTime(ts: number, now?: number): string;
export declare function clamp(value: number, min: number, max: number): number;
export declare function slugify(input: string): string;
export declare function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]>;
export declare function uniqueBy<T>(items: T[], key: (item: T) => unknown): T[];
export interface FieldChange {
    key: string;
    before: unknown;
    after: unknown;
}
/**
 * Shallow diff of two flat-ish objects. Returns the keys whose JSON-serialized
 * values differ (added / removed / changed). Used to preview settings bundles
 * before applying them.
 */
export declare function diffObjects(before: Record<string, any>, after: Record<string, any>): FieldChange[];
export declare function titleCase(input: string): string;
export declare function truncate(input: string, max: number): string;

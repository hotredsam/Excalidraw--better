/** Small functional collection helpers (pure, dependency-free). */
export declare function sortBy<T>(items: T[], key: (item: T) => number | string, dir?: 'asc' | 'desc'): T[];
export declare function partition<T>(items: T[], pred: (item: T) => boolean): [T[], T[]];
export declare function chunk<T>(items: T[], size: number): T[][];
export declare function range(start: number, end?: number, step?: number): number[];
export declare function sum(items: number[]): number;
export declare function average(items: number[]): number;
export declare function first<T>(items: T[]): T | undefined;
export declare function last<T>(items: T[]): T | undefined;
export declare function compact<T>(items: (T | null | undefined | false | 0 | '')[]): T[];
export declare function keyBy<T>(items: T[], key: (item: T) => string): Record<string, T>;
export declare function move<T>(items: T[], from: number, to: number): T[];

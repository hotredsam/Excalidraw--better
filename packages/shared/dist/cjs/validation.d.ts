/** Tiny validation / data-shaping helpers (pure, dependency-free). */
export declare function isHexColor(v: string): boolean;
export declare function isEmail(v: string): boolean;
export declare function isUrl(v: string): boolean;
export declare function safeJsonParse<T = unknown>(text: string, fallback?: T | null): T | null;
export declare function ensureArray<T>(v: T | T[] | undefined | null): T[];
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export declare function isNonEmptyString(v: unknown): v is string;
export declare function coerceNumber(v: unknown, fallback?: number): number;

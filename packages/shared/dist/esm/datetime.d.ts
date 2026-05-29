/** Date/time formatting helpers (pure; local time). */
export declare function formatTime(d: Date | number): string;
export declare function formatDateTime(d: Date | number): string;
export declare function startOfDay(d: Date | number): Date;
export declare function daysBetween(a: Date | number, b: Date | number): number;
export declare function isToday(d: Date | number, now?: Date | number): boolean;
export declare function isSameDay(a: Date | number, b: Date | number): boolean;
/** Human-friendly duration from milliseconds, e.g. "1h 5m" or "12s". */
export declare function formatDuration(ms: number): string;

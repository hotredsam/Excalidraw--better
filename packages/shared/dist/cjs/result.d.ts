/** A tiny Result type for explicit success/failure flows (no exceptions). */
export type Result<T, E = string> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare function ok<T>(value: T): Result<T, never>;
export declare function err<E>(error: E): Result<never, E>;
export declare function isOk<T, E>(r: Result<T, E>): r is {
    ok: true;
    value: T;
};
export declare function mapResult<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E>;
export declare function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T;
/** Run a function, capturing thrown errors as a Result. */
export declare function tryCatch<T>(fn: () => T): Result<T, string>;
export declare function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, string>>;

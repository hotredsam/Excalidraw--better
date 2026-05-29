/** A tiny Result type for explicit success/failure flows (no exceptions). */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok;
}

export function mapResult<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}

export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}

/** Run a function, capturing thrown errors as a Result. */
export function tryCatch<T>(fn: () => T): Result<T, string> {
  try {
    return ok(fn());
  } catch (e: any) {
    return err(e?.message ? String(e.message) : String(e));
  }
}

export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, string>> {
  try {
    return ok(await fn());
  } catch (e: any) {
    return err(e?.message ? String(e.message) : String(e));
  }
}

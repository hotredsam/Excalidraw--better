export function ok(value) {
    return { ok: true, value };
}
export function err(error) {
    return { ok: false, error };
}
export function isOk(r) {
    return r.ok;
}
export function mapResult(r, fn) {
    return r.ok ? ok(fn(r.value)) : r;
}
export function unwrapOr(r, fallback) {
    return r.ok ? r.value : fallback;
}
/** Run a function, capturing thrown errors as a Result. */
export function tryCatch(fn) {
    try {
        return ok(fn());
    }
    catch (e) {
        return err(e?.message ? String(e.message) : String(e));
    }
}
export async function tryCatchAsync(fn) {
    try {
        return ok(await fn());
    }
    catch (e) {
        return err(e?.message ? String(e.message) : String(e));
    }
}

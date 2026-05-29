"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.err = err;
exports.isOk = isOk;
exports.mapResult = mapResult;
exports.unwrapOr = unwrapOr;
exports.tryCatch = tryCatch;
exports.tryCatchAsync = tryCatchAsync;
function ok(value) {
    return { ok: true, value };
}
function err(error) {
    return { ok: false, error };
}
function isOk(r) {
    return r.ok;
}
function mapResult(r, fn) {
    return r.ok ? ok(fn(r.value)) : r;
}
function unwrapOr(r, fallback) {
    return r.ok ? r.value : fallback;
}
/** Run a function, capturing thrown errors as a Result. */
function tryCatch(fn) {
    try {
        return ok(fn());
    }
    catch (e) {
        return err(e?.message ? String(e.message) : String(e));
    }
}
async function tryCatchAsync(fn) {
    try {
        return ok(await fn());
    }
    catch (e) {
        return err(e?.message ? String(e.message) : String(e));
    }
}

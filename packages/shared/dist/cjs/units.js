"use strict";
/** Numeric/unit helpers for zoom, scaling and percentages (pure). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ZOOM = exports.MIN_ZOOM = void 0;
exports.clampZoom = clampZoom;
exports.zoomToPercent = zoomToPercent;
exports.percentToZoom = percentToZoom;
exports.roundTo = roundTo;
exports.lerp = lerp;
exports.mapRange = mapRange;
exports.snap = snap;
exports.MIN_ZOOM = 0.1;
exports.MAX_ZOOM = 30;
function clampZoom(zoom) {
    if (!Number.isFinite(zoom))
        return 1;
    return Math.min(exports.MAX_ZOOM, Math.max(exports.MIN_ZOOM, zoom));
}
function zoomToPercent(zoom) {
    return Math.round(clampZoom(zoom) * 100);
}
function percentToZoom(percent) {
    return clampZoom(percent / 100);
}
function roundTo(value, decimals = 2) {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
}
function lerp(a, b, t) {
    return a + (b - a) * Math.min(1, Math.max(0, t));
}
function mapRange(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin)
        return outMin;
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}
function snap(value, step) {
    if (step <= 0)
        return value;
    return Math.round(value / step) * step;
}

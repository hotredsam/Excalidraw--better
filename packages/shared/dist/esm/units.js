/** Numeric/unit helpers for zoom, scaling and percentages (pure). */
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;
export function clampZoom(zoom) {
    if (!Number.isFinite(zoom))
        return 1;
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}
export function zoomToPercent(zoom) {
    return Math.round(clampZoom(zoom) * 100);
}
export function percentToZoom(percent) {
    return clampZoom(percent / 100);
}
export function roundTo(value, decimals = 2) {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
}
export function lerp(a, b, t) {
    return a + (b - a) * Math.min(1, Math.max(0, t));
}
export function mapRange(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin)
        return outMin;
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}
export function snap(value, step) {
    if (step <= 0)
        return value;
    return Math.round(value / step) * step;
}

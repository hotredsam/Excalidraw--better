/** Numeric/unit helpers for zoom, scaling and percentages (pure). */

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function zoomToPercent(zoom: number): number {
  return Math.round(clampZoom(zoom) * 100);
}

export function percentToZoom(percent: number): number {
  return clampZoom(percent / 100);
}

export function roundTo(value: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

export function snap(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/** Numeric/unit helpers for zoom, scaling and percentages (pure). */
export declare const MIN_ZOOM = 0.1;
export declare const MAX_ZOOM = 30;
export declare function clampZoom(zoom: number): number;
export declare function zoomToPercent(zoom: number): number;
export declare function percentToZoom(percent: number): number;
export declare function roundTo(value: number, decimals?: number): number;
export declare function lerp(a: number, b: number, t: number): number;
export declare function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
export declare function snap(value: number, step: number): number;

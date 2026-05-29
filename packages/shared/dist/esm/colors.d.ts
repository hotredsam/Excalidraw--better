/**
 * Small color utilities (no dependencies) used for theming, palette chips and
 * contrast-aware text. All functions are pure and tested.
 */
export interface RGB {
    r: number;
    g: number;
    b: number;
}
/** Parse #rgb / #rrggbb (with or without leading #) into an RGB triple. */
export declare function parseHex(hex: string): RGB | null;
export declare function toHex({ r, g, b }: RGB): string;
/** Relative luminance per WCAG (0 = black, 1 = white). */
export declare function luminance(rgb: RGB): number;
/** WCAG contrast ratio between two colors (1..21). */
export declare function contrastRatio(a: RGB, b: RGB): number;
/** Pick black or white text for best contrast on a background hex. */
export declare function readableTextColor(bgHex: string): '#000000' | '#ffffff';
export declare function mix(a: RGB, b: RGB, t: number): RGB;
export declare function lighten(hex: string, amount: number): string;
export declare function darken(hex: string, amount: number): string;
/** Deterministically derive a pleasant chip color from an arbitrary string. */
export declare function colorForString(input: string): string;
export declare function hslToHex(h: number, s: number, l: number): string;

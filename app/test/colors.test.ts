import { describe, it, expect } from 'vitest';
import {
  parseHex,
  toHex,
  luminance,
  contrastRatio,
  readableTextColor,
  lighten,
  darken,
  colorForString,
  hslToHex,
} from '@excalibur/shared';

describe('parseHex / toHex', () => {
  it('parses 3- and 6-digit hex with or without #', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#FF7A1A')).toEqual({ r: 255, g: 122, b: 26 });
  });
  it('rejects invalid input', () => {
    expect(parseHex('nope')).toBeNull();
    expect(parseHex('#12')).toBeNull();
    expect(parseHex('#zzzzzz')).toBeNull();
  });
  it('round-trips through toHex', () => {
    expect(toHex({ r: 255, g: 122, b: 26 })).toBe('#ff7a1a');
    expect(toHex({ r: 300, g: -5, b: 26 })).toBe('#ff001a'); // clamped
  });
});

describe('luminance / contrast', () => {
  it('white is brighter than black', () => {
    expect(luminance({ r: 255, g: 255, b: 255 })).toBeGreaterThan(luminance({ r: 0, g: 0, b: 0 }));
  });
  it('black/white contrast is the maximum 21', () => {
    expect(Math.round(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }))).toBe(21);
  });
  it('picks readable text color', () => {
    expect(readableTextColor('#ffffff')).toBe('#000000');
    expect(readableTextColor('#0b0d12')).toBe('#ffffff');
    expect(readableTextColor('xyz')).toBe('#ffffff'); // invalid hex -> fallback
    expect(readableTextColor('#bbaadd')).toBe('#000000'); // light bg -> dark text
  });
});

describe('lighten / darken / derive', () => {
  it('lighten moves toward white, darken toward black', () => {
    expect(lighten('#808080', 1)).toBe('#ffffff');
    expect(darken('#808080', 1)).toBe('#000000');
    expect(lighten('notacolor', 0.5)).toBe('notacolor');
  });
  it('colorForString is deterministic and valid hex', () => {
    const a = colorForString('architecture');
    expect(a).toBe(colorForString('architecture'));
    expect(parseHex(a)).not.toBeNull();
    expect(colorForString('a')).not.toBe(colorForString('b'));
  });
  it('hslToHex produces valid hex', () => {
    expect(parseHex(hslToHex(0, 100, 50))).toEqual({ r: 255, g: 0, b: 0 });
  });
});

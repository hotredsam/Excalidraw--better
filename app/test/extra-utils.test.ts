import { describe, it, expect } from 'vitest';
import { formatRelativeTime, applyRenameTemplate, darken, lighten, mix, parseHex } from '@excalibur/shared';

describe('formatRelativeTime longer ranges', () => {
  const now = new Date('2026-06-01T00:00:00').getTime();
  it('covers weeks, months and years', () => {
    expect(formatRelativeTime(now - 10 * 86_400_000, now)).toBe('1w ago');
    expect(formatRelativeTime(now - 60 * 86_400_000, now)).toBe('2mo ago');
    expect(formatRelativeTime(now - 800 * 86_400_000, now)).toBe('2y ago');
  });
});

describe('applyRenameTemplate time token', () => {
  it('expands {time} as HHMM', () => {
    const d = new Date('2026-06-01T09:07:00');
    expect(applyRenameTemplate('{name}-{time}', { name: 'x', ext: '.excalidraw', n: 1, date: d })).toBe(
      'x-0907.excalidraw',
    );
  });
});

describe('color mixing edges', () => {
  it('mix clamps t and lighten/darken pass through invalid input', () => {
    expect(mix({ r: 0, g: 0, b: 0 }, { r: 100, g: 100, b: 100 }, 2)).toEqual({ r: 100, g: 100, b: 100 });
    expect(mix({ r: 0, g: 0, b: 0 }, { r: 100, g: 100, b: 100 }, -1)).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex(lighten('#000000', 0.5))).toEqual({ r: 128, g: 128, b: 128 });
    expect(parseHex(darken('#ffffff', 0.5))).toEqual({ r: 128, g: 128, b: 128 });
  });
});

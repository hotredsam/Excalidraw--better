import { describe, it, expect } from 'vitest';
import {
  clampZoom,
  zoomToPercent,
  percentToZoom,
  roundTo,
  lerp,
  mapRange,
  snap,
  MIN_ZOOM,
  MAX_ZOOM,
} from '@excalibur/shared';

describe('units', () => {
  it('clampZoom bounds and handles non-finite', () => {
    expect(clampZoom(0.001)).toBe(MIN_ZOOM);
    expect(clampZoom(999)).toBe(MAX_ZOOM);
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(NaN)).toBe(1);
  });
  it('zoom <-> percent', () => {
    expect(zoomToPercent(1)).toBe(100);
    expect(zoomToPercent(2.5)).toBe(250);
    expect(percentToZoom(150)).toBe(1.5);
  });
  it('roundTo', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
    expect(roundTo(2.5, 0)).toBe(3);
  });
  it('lerp clamps t', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, -1)).toBe(0);
    expect(lerp(0, 10, 2)).toBe(10);
  });
  it('mapRange', () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(mapRange(5, 0, 0, 1, 2)).toBe(1); // degenerate input range
  });
  it('snap', () => {
    expect(snap(23, 10)).toBe(20);
    expect(snap(27, 10)).toBe(30);
    expect(snap(5, 0)).toBe(5);
  });
});

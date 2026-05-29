import { describe, it, expect } from 'vitest';
import {
  distance,
  centerOf,
  pointInBox,
  expandBox,
  translateBox,
  normalizeRect,
  boxesIntersect,
  boundingBox,
  clampPointToBox,
} from '@excalibur/shared';

const box = { x: 0, y: 0, width: 100, height: 50 };

describe('geometry', () => {
  it('distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
  it('centerOf', () => {
    expect(centerOf(box)).toEqual({ x: 50, y: 25 });
  });
  it('pointInBox', () => {
    expect(pointInBox({ x: 50, y: 25 }, box)).toBe(true);
    expect(pointInBox({ x: 200, y: 25 }, box)).toBe(false);
  });
  it('expandBox / translateBox', () => {
    expect(expandBox(box, 10)).toEqual({ x: -10, y: -10, width: 120, height: 70 });
    expect(translateBox(box, 5, 5)).toEqual({ x: 5, y: 5, width: 100, height: 50 });
  });
  it('normalizeRect handles negative deltas', () => {
    expect(normalizeRect(100, 80, 0, 0)).toEqual({ x: 0, y: 0, width: 100, height: 80 });
  });
  it('boxesIntersect', () => {
    expect(boxesIntersect(box, { x: 50, y: 25, width: 100, height: 100 })).toBe(true);
    expect(boxesIntersect(box, { x: 200, y: 200, width: 10, height: 10 })).toBe(false);
  });
  it('boundingBox unions elements and ignores invalid ones', () => {
    const bb = boundingBox([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 90, y: 40, width: 10, height: 10 },
      { width: 5 } as any,
    ]);
    expect(bb).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    expect(boundingBox([])).toBeNull();
  });
  it('clampPointToBox', () => {
    expect(clampPointToBox({ x: -10, y: 999 }, box)).toEqual({ x: 0, y: 50 });
  });
});

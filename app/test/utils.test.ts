import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatRelativeTime,
  clamp,
  slugify,
  groupBy,
  uniqueBy,
  diffObjects,
  titleCase,
  truncate,
} from '@excalibur/shared';

describe('formatBytes', () => {
  it('formats across units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });
});

describe('formatRelativeTime', () => {
  const now = 1_000_000_000_000;
  it('describes recent and older times', () => {
    expect(formatRelativeTime(now, now)).toBe('just now');
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5m ago');
    expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe('3h ago');
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe('2d ago');
  });
});

describe('misc helpers', () => {
  it('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
  it('slugify', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  multiple   spaces ')).toBe('multiple-spaces');
    expect(slugify('***')).toBe('untitled');
  });
  it('groupBy / uniqueBy', () => {
    const g = groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'));
    expect(g.even).toEqual([2, 4]);
    expect(uniqueBy([{ a: 1 }, { a: 1 }, { a: 2 }], (x) => x.a)).toHaveLength(2);
  });
  it('titleCase / truncate', () => {
    expect(titleCase('hello WORLD')).toBe('Hello World');
    expect(truncate('abcdef', 4)).toBe('abc…');
    expect(truncate('ab', 4)).toBe('ab');
  });
});

describe('diffObjects', () => {
  it('reports added, removed and changed keys', () => {
    const changes = diffObjects({ a: 1, b: 2, c: 3 }, { a: 1, b: 5, d: 9 });
    const byKey = Object.fromEntries(changes.map((c) => [c.key, c]));
    expect(byKey.b).toEqual({ key: 'b', before: 2, after: 5 });
    expect(byKey.c).toEqual({ key: 'c', before: 3, after: undefined });
    expect(byKey.d).toEqual({ key: 'd', before: undefined, after: 9 });
    expect(byKey.a).toBeUndefined();
  });
});

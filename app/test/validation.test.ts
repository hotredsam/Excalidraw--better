import { describe, it, expect } from 'vitest';
import {
  isHexColor,
  isEmail,
  isUrl,
  safeJsonParse,
  ensureArray,
  pick,
  omit,
  isNonEmptyString,
  coerceNumber,
} from '@excalibur/shared';

describe('validation helpers', () => {
  it('isHexColor', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('ff7a1a')).toBe(true);
    expect(isHexColor('#zzz')).toBe(false);
    expect(isHexColor('red')).toBe(false);
  });
  it('isEmail', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('nope')).toBe(false);
  });
  it('isUrl', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('ftp://x')).toBe(false);
    expect(isUrl('not a url')).toBe(false);
  });
  it('safeJsonParse', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonParse('nope', { fallback: true })).toEqual({ fallback: true });
    expect(safeJsonParse('bad')).toBeNull();
  });
  it('ensureArray', () => {
    expect(ensureArray(1)).toEqual([1]);
    expect(ensureArray([1, 2])).toEqual([1, 2]);
    expect(ensureArray(null)).toEqual([]);
  });
  it('pick / omit', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });
  it('isNonEmptyString / coerceNumber', () => {
    expect(isNonEmptyString('x')).toBe(true);
    expect(isNonEmptyString('  ')).toBe(false);
    expect(isNonEmptyString(5)).toBe(false);
    expect(coerceNumber('42')).toBe(42);
    expect(coerceNumber('nan', 7)).toBe(7);
  });
});

import { describe, it, expect } from 'vitest';
import { diffObjects, formatValue } from '../src/lib/diff';

describe('renderer diffObjects', () => {
  it('detects changed, added and removed keys', () => {
    const changes = diffObjects({ a: 1, b: true, c: 'x' }, { a: 1, b: false, d: 5 });
    const map = Object.fromEntries(changes.map((c) => [c.key, c]));
    expect(map.b).toEqual({ key: 'b', before: true, after: false });
    expect(map.c.after).toBeUndefined();
    expect(map.d.before).toBeUndefined();
    expect(map.a).toBeUndefined();
  });
  it('formatValue renders primitives and dashes for undefined', () => {
    expect(formatValue('hi')).toBe('hi');
    expect(formatValue(true)).toBe('true');
    expect(formatValue(undefined)).toBe('—');
    expect(formatValue(15)).toBe('15');
  });
});

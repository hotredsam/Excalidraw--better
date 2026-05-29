import { describe, it, expect } from 'vitest';
import { sortBy, partition, chunk, range, sum, average, first, last, compact, keyBy, move } from '@excalibur/shared';

describe('collections', () => {
  it('sortBy asc/desc', () => {
    const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
    expect(sortBy(items, (x) => x.n).map((x) => x.n)).toEqual([1, 2, 3]);
    expect(sortBy(items, (x) => x.n, 'desc').map((x) => x.n)).toEqual([3, 2, 1]);
  });
  it('partition', () => {
    const [evens, odds] = partition([1, 2, 3, 4], (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3]);
  });
  it('chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('range', () => {
    expect(range(3)).toEqual([0, 1, 2]);
    expect(range(1, 4)).toEqual([1, 2, 3]);
    expect(range(5, 0, -2)).toEqual([5, 3, 1]);
  });
  it('sum / average', () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(average([2, 4])).toBe(3);
    expect(average([])).toBe(0);
  });
  it('first / last / compact', () => {
    expect(first([1, 2])).toBe(1);
    expect(last([1, 2])).toBe(2);
    expect(compact([0, 1, '', 'x', null, undefined, false, 2])).toEqual([1, 'x', 2]);
  });
  it('keyBy', () => {
    expect(keyBy([{ id: 'a' }, { id: 'b' }], (x) => x.id)).toEqual({ a: { id: 'a' }, b: { id: 'b' } });
  });
  it('move reorders', () => {
    expect(move(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(move(['a', 'b'], 5, 0)).toEqual(['a', 'b']); // out of range is a no-op
  });
});

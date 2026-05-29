import { describe, it, expect } from 'vitest';
import { toCSV, parseCSV, ok, err, isOk, mapResult, unwrapOr, tryCatch, tryCatchAsync } from '@excalibur/shared';

describe('CSV', () => {
  it('serializes rows with a derived header', () => {
    const csv = toCSV([{ name: 'a', n: 1 }, { name: 'b', n: 2 }]);
    expect(csv).toBe('name,n\na,1\nb,2');
  });
  it('escapes commas, quotes and newlines', () => {
    const csv = toCSV([{ v: 'a,b' }, { v: 'he said "hi"' }, { v: 'line1\nline2' }]);
    expect(csv).toContain('"a,b"');
    expect(csv).toContain('"he said ""hi"""');
    expect(csv).toContain('"line1\nline2"');
  });
  it('round-trips through parseCSV', () => {
    const rows = [{ name: 'x,y', count: '3' }, { name: 'z', count: '4' }];
    const parsed = parseCSV(toCSV(rows));
    expect(parsed).toEqual(rows);
  });
  it('handles empty input', () => {
    expect(toCSV([])).toBe('');
    expect(parseCSV('')).toEqual([]);
  });
});

describe('Result', () => {
  it('ok / err / isOk', () => {
    expect(isOk(ok(5))).toBe(true);
    expect(isOk(err('bad'))).toBe(false);
  });
  it('mapResult only maps success', () => {
    expect(mapResult(ok(2), (n) => n * 3)).toEqual({ ok: true, value: 6 });
    expect(mapResult(err('e'), (n: number) => n * 3)).toEqual({ ok: false, error: 'e' });
  });
  it('unwrapOr', () => {
    expect(unwrapOr(ok(1), 9)).toBe(1);
    expect(unwrapOr(err('x'), 9)).toBe(9);
  });
  it('tryCatch captures thrown errors', () => {
    expect(tryCatch(() => 1)).toEqual({ ok: true, value: 1 });
    const r = tryCatch(() => {
      throw new Error('boom');
    });
    expect(r).toEqual({ ok: false, error: 'boom' });
  });
  it('tryCatchAsync captures rejections', async () => {
    expect(await tryCatchAsync(async () => 2)).toEqual({ ok: true, value: 2 });
    expect(await tryCatchAsync(async () => { throw new Error('nope'); })).toEqual({ ok: false, error: 'nope' });
  });
});

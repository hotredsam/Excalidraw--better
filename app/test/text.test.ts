import { describe, it, expect } from 'vitest';
import { pluralize, ordinal, middleTruncate, parseFilename, humanizeKey, pad2, isoDate, countWords } from '@excalibur/shared';

describe('text helpers', () => {
  it('pluralize', () => {
    expect(pluralize(1, 'file')).toBe('1 file');
    expect(pluralize(3, 'file')).toBe('3 files');
    expect(pluralize(2, 'entry', 'entries')).toBe('2 entries');
  });
  it('ordinal', () => {
    expect(ordinal(1)).toBe('1st');
    expect(ordinal(2)).toBe('2nd');
    expect(ordinal(3)).toBe('3rd');
    expect(ordinal(4)).toBe('4th');
    expect(ordinal(11)).toBe('11th');
    expect(ordinal(21)).toBe('21st');
  });
  it('middleTruncate keeps both ends', () => {
    expect(middleTruncate('short', 10)).toBe('short');
    const t = middleTruncate('/a/very/long/path/to/file.excalidraw', 20);
    expect(t.length).toBeLessThanOrEqual(20);
    expect(t).toContain('…');
    expect(t.startsWith('/a/very')).toBe(true);
  });
  it('parseFilename', () => {
    expect(parseFilename('a.excalidraw')).toEqual({ base: 'a', ext: '.excalidraw' });
    expect(parseFilename('noext')).toEqual({ base: 'noext', ext: '' });
    expect(parseFilename('.hidden')).toEqual({ base: '.hidden', ext: '' });
  });
  it('humanizeKey', () => {
    expect(humanizeKey('autosaveIntervalSeconds')).toBe('Autosave Interval Seconds');
    expect(humanizeKey('default_export_format')).toBe('Default export format');
  });
  it('pad2 / isoDate', () => {
    expect(pad2(5)).toBe('05');
    expect(isoDate(new Date('2026-01-09T00:00:00'))).toBe('2026-01-09');
  });
  it('countWords', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('  hello   world ')).toBe(2);
  });
});

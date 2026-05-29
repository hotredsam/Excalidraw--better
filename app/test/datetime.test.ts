import { describe, it, expect } from 'vitest';
import { formatTime, formatDateTime, startOfDay, daysBetween, isToday, isSameDay, formatDuration } from '@excalibur/shared';

describe('datetime', () => {
  it('formatTime / formatDateTime', () => {
    const d = new Date('2026-05-29T09:05:00');
    expect(formatTime(d)).toBe('09:05');
    expect(formatDateTime(d)).toBe('2026-05-29 09:05');
  });
  it('startOfDay zeroes the time', () => {
    const d = new Date('2026-05-29T13:45:30');
    const s = startOfDay(d);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
  });
  it('daysBetween / isToday / isSameDay', () => {
    const a = new Date('2026-05-29T23:00:00');
    const b = new Date('2026-05-31T01:00:00');
    expect(daysBetween(a, b)).toBe(2);
    expect(isToday(Date.now())).toBe(true);
    expect(isSameDay(a, new Date('2026-05-29T01:00:00'))).toBe(true);
  });
  it('formatDuration', () => {
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(12_000)).toBe('12s');
    expect(formatDuration(65_000)).toBe('1m 5s');
    expect(formatDuration(3_725_000)).toBe('1h 2m 5s');
  });
});

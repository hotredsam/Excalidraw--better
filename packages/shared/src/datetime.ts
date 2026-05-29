/** Date/time formatting helpers (pure; local time). */

function p2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatTime(d: Date | number): string {
  const dt = typeof d === 'number' ? new Date(d) : d;
  return `${p2(dt.getHours())}:${p2(dt.getMinutes())}`;
}

export function formatDateTime(d: Date | number): string {
  const dt = typeof d === 'number' ? new Date(d) : d;
  return `${dt.getFullYear()}-${p2(dt.getMonth() + 1)}-${p2(dt.getDate())} ${formatTime(dt)}`;
}

export function startOfDay(d: Date | number): Date {
  const dt = typeof d === 'number' ? new Date(d) : new Date(d.getTime());
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function daysBetween(a: Date | number, b: Date | number): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function isToday(d: Date | number, now: Date | number = Date.now()): boolean {
  return daysBetween(d, now) === 0;
}

export function isSameDay(a: Date | number, b: Date | number): boolean {
  return daysBetween(a, b) === 0;
}

/** Human-friendly duration from milliseconds, e.g. "1h 5m" or "12s". */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))}ms`;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

/** Small functional collection helpers (pure, dependency-free). */

export function sortBy<T>(items: T[], key: (item: T) => number | string, dir: 'asc' | 'desc' = 'asc'): T[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka < kb) return -1 * sign;
    if (ka > kb) return 1 * sign;
    return 0;
  });
}

export function partition<T>(items: T[], pred: (item: T) => boolean): [T[], T[]] {
  const yes: T[] = [];
  const no: T[] = [];
  for (const item of items) (pred(item) ? yes : no).push(item);
  return [yes, no];
}

export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function range(start: number, end?: number, step = 1): number[] {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const out: number[] = [];
  if (step === 0) return out;
  if (step > 0) for (let i = from; i < to; i += step) out.push(i);
  else for (let i = from; i > to; i += step) out.push(i);
  return out;
}

export function sum(items: number[]): number {
  return items.reduce((a, b) => a + b, 0);
}

export function average(items: number[]): number {
  return items.length === 0 ? 0 : sum(items) / items.length;
}

export function first<T>(items: T[]): T | undefined {
  return items[0];
}

export function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

export function compact<T>(items: (T | null | undefined | false | 0 | '')[]): T[] {
  return items.filter(Boolean) as T[];
}

export function keyBy<T>(items: T[], key: (item: T) => string): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of items) out[key(item)] = item;
  return out;
}

export function move<T>(items: T[], from: number, to: number): T[] {
  const out = [...items];
  if (from < 0 || from >= out.length || to < 0 || to >= out.length) return out;
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

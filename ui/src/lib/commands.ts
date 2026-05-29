import type { Command } from '@excalibur/shared';

/**
 * Local copy of the fuzzy command matcher. Kept in the renderer (rather than
 * imported from `@excalibur/shared`) because the shared package is consumed as
 * CommonJS by the Electron main process; pulling *runtime* helpers across that
 * boundary into the Vite bundle is brittle. Types are still imported from shared.
 * Behaviour mirrors `feature-utils.fuzzyScore` and is covered by the shared tests.
 */
export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  let qi = 0;
  let score = 0;
  let streak = 0;
  let lastIdx = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak += 1;
      score += streak * 2;
      if (lastIdx === ti - 1) score += 3;
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-') score += 5;
      lastIdx = ti;
      qi++;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : -1;
}

export function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands;
  return commands
    .map((c) => ({ c, s: Math.max(fuzzyScore(query, c.title), fuzzyScore(query, `${c.category} ${c.title}`)) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}

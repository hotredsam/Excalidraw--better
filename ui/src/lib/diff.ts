/**
 * Object diff for settings/bundle previews. `diffObjects`/`FieldChange` are
 * re-exported from `@excalibur/shared` (ESM build); `formatValue` is a
 * renderer-only display helper.
 */
export { diffObjects } from '@excalibur/shared';
export type { FieldChange } from '@excalibur/shared';

export function formatValue(v: unknown): string {
  if (v === undefined) return '—';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

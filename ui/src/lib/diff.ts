/**
 * Local object diff for the renderer (mirrors shared `diffObjects`; kept local to
 * avoid importing runtime helpers across the CommonJS shared boundary).
 */
export interface FieldChange {
  key: string;
  before: unknown;
  after: unknown;
}

export function diffObjects(before: Record<string, any>, after: Record<string, any>): FieldChange[] {
  const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
  const changes: FieldChange[] = [];
  for (const key of keys) {
    const b = before?.[key];
    const a = after?.[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) changes.push({ key, before: b, after: a });
  }
  return changes;
}

export function formatValue(v: unknown): string {
  if (v === undefined) return '—';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

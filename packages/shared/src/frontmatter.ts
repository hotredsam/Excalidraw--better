/**
 * Minimal YAML-frontmatter parser/serializer (no external deps). Supports the
 * subset used by Excalibur's markdown export: scalar strings/numbers/booleans
 * and simple inline arrays (`tags: ["a", "b"]`). Good enough for vault-style
 * round-tripping; not a full YAML implementation.
 */

export interface Frontmatter {
  data: Record<string, any>;
  body: string;
}

function parseScalar(raw: string): any {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  // inline array
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((s) => parseScalar(s));
  }
  // quoted string
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

export function parseFrontmatter(text: string): Frontmatter {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data: Record<string, any> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    data[key] = parseScalar(line.slice(idx + 1));
  }
  return { data, body: match[2] };
}

function serializeScalar(v: any): string {
  if (Array.isArray(v)) return `[${v.map((x) => serializeScalar(x)).join(', ')}]`;
  if (typeof v === 'string') return `"${v.replace(/"/g, '\\"')}"`;
  if (v === null || v === undefined) return 'null';
  return String(v);
}

export function stringifyFrontmatter(data: Record<string, any>, body = ''): string {
  const keys = Object.keys(data);
  if (keys.length === 0) return body;
  const lines = ['---', ...keys.map((k) => `${k}: ${serializeScalar(data[k])}`), '---', ''];
  return lines.join('\n') + body;
}

import { Slide, GitStatus, GitFileStatus, Command, MarkdownOptions } from './features';

// ── Bulk rename templating ────────────────────────────────────────────────
export interface RenameContext {
  name: string; // base name without extension
  ext: string; // extension including the dot, e.g. ".excalidraw"
  n: number; // sequence number
  padWidth?: number;
  date?: Date;
}

/**
 * Expand a rename template. Supported tokens:
 *   {name} {ext} {n} {date} {time} {YYYY} {MM} {DD}
 */
export function applyRenameTemplate(template: string, ctx: RenameContext): string {
  const d = ctx.date ?? new Date();
  const pad = (v: number, w: number) => String(v).padStart(w, '0');
  const yyyy = String(d.getFullYear());
  const mm = pad(d.getMonth() + 1, 2);
  const dd = pad(d.getDate(), 2);
  const seq = ctx.padWidth ? pad(ctx.n, ctx.padWidth) : String(ctx.n);

  let out = template
    .replace(/\{name\}/g, ctx.name)
    .replace(/\{ext\}/g, ctx.ext)
    .replace(/\{n\}/g, seq)
    .replace(/\{YYYY\}/g, yyyy)
    .replace(/\{MM\}/g, mm)
    .replace(/\{DD\}/g, dd)
    .replace(/\{date\}/g, `${yyyy}-${mm}-${dd}`)
    .replace(/\{time\}/g, `${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}`);

  // Ensure the extension is present exactly once.
  if (ctx.ext && !out.toLowerCase().endsWith(ctx.ext.toLowerCase())) {
    out += ctx.ext;
  }
  return out;
}

// ── Presentation: frames → slides ─────────────────────────────────────────
/**
 * Extract slides from a scene's frame elements, ordered left-to-right then
 * top-to-bottom (reading order). If there are no frames, returns a single
 * slide covering the whole content bounding box.
 */
export function extractSlidesFromScene(scene: any): Slide[] {
  const elements: any[] = Array.isArray(scene?.elements) ? scene.elements : [];
  const frames = elements.filter((el) => el && el.type === 'frame' && !el.isDeleted);

  if (frames.length === 0) {
    const visible = elements.filter((el) => el && !el.isDeleted && typeof el.x === 'number');
    if (visible.length === 0) return [];
    const minX = Math.min(...visible.map((e) => e.x));
    const minY = Math.min(...visible.map((e) => e.y));
    const maxX = Math.max(...visible.map((e) => e.x + (e.width || 0)));
    const maxY = Math.max(...visible.map((e) => e.y + (e.height || 0)));
    return [
      { id: 'all', name: 'Full canvas', index: 0, x: minX, y: minY, width: maxX - minX, height: maxY - minY, notes: '' },
    ];
  }

  const sorted = [...frames].sort((a, b) => {
    const rowA = Math.round(a.y / 200);
    const rowB = Math.round(b.y / 200);
    if (rowA !== rowB) return rowA - rowB;
    return a.x - b.x;
  });

  return sorted.map((f, i) => ({
    id: f.id,
    name: f.name || `Slide ${i + 1}`,
    index: i,
    x: f.x,
    y: f.y,
    width: f.width || 0,
    height: f.height || 0,
    notes: '',
  }));
}

// ── Markdown export ───────────────────────────────────────────────────────
export function buildMarkdown(opts: MarkdownOptions, imageRelPath: string, bodyText = ''): string {
  const lines: string[] = [];
  const title = opts.title || imageRelPath.replace(/\.[^.]+$/, '').split('/').pop() || 'Drawing';

  if (opts.includeFrontmatter) {
    lines.push('---');
    lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
    if (opts.tags.length) lines.push(`tags: [${opts.tags.map((t) => `"${t}"`).join(', ')}]`);
    lines.push(`created: ${new Date().toISOString()}`);
    lines.push('---', '');
  }

  lines.push(`# ${title}`, '');
  lines.push(`![${title}](${imageRelPath})`, '');
  if (bodyText.trim()) {
    lines.push('## Notes', '', bodyText.trim(), '');
  }
  return lines.join('\n');
}

// ── Git porcelain parsing ─────────────────────────────────────────────────
/** Parse the output of `git status --porcelain=v1 -b`. */
export function parseGitStatus(porcelain: string): GitStatus {
  const lines = porcelain.split(/\r?\n/).filter(Boolean);
  const status: GitStatus = { isRepo: true, ahead: 0, behind: 0, files: [], clean: true };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const header = line.slice(3);
      const branchMatch = header.match(/^([^.\s]+)/);
      if (branchMatch) status.branch = branchMatch[1];
      const ahead = header.match(/ahead (\d+)/);
      const behind = header.match(/behind (\d+)/);
      if (ahead) status.ahead = parseInt(ahead[1], 10);
      if (behind) status.behind = parseInt(behind[1], 10);
      continue;
    }
    const index = line[0];
    const working = line[1];
    const path = line.slice(3);
    const f: GitFileStatus = { path, index: index.trim(), working: working.trim() };
    status.files.push(f);
  }
  status.clean = status.files.length === 0;
  return status;
}

// ── Fuzzy command search ──────────────────────────────────────────────────
/** Subsequence fuzzy match returning a score (higher = better) or -1. */
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
      if (lastIdx === ti - 1) score += 3; // contiguous bonus
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-') score += 5; // word-start bonus
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

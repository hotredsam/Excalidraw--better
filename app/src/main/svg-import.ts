import { nanoid } from 'nanoid';

/**
 * Best-effort SVG → Excalidraw element conversion. The Electron main process
 * has no DOM, so primitives are parsed with regular expressions. Supported:
 * `<rect>`, `<circle>`, `<ellipse>`, `<line>`, and `<text>`. Anything else is
 * skipped — callers can still embed the raw SVG as an image via `import-pack`.
 */

interface BaseOpts {
  stroke?: string;
  fill?: string;
}

function baseElement(type: string, x: number, y: number, width: number, height: number, opts: BaseOpts = {}) {
  return {
    id: nanoid(20),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: opts.stroke && opts.stroke !== 'none' ? opts.stroke : '#1e1e1e',
    backgroundColor: opts.fill && opts.fill !== 'none' ? opts.fill : 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [] as string[],
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 2 ** 31),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2 ** 31),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`)) || tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`));
  return m ? m[1] : undefined;
}
function num(tag: string, name: string, def = 0): number {
  const v = attr(tag, name);
  const n = v != null ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : def;
}
function style(tag: string): BaseOpts {
  return { stroke: attr(tag, 'stroke'), fill: attr(tag, 'fill') };
}

export interface SvgImportResult {
  elements: any[];
  skipped: number;
}

export function parseSvgToElements(svg: string): SvgImportResult {
  const elements: any[] = [];
  let skipped = 0;

  const tags = svg.match(/<(rect|circle|ellipse|line|text)\b[^>]*?(?:\/>|>[\s\S]*?<\/\1>)/g) || [];
  for (const tag of tags) {
    const kind = (tag.match(/^<(\w+)/) || [])[1];
    const s = style(tag);
    if (kind === 'rect') {
      elements.push(baseElement('rectangle', num(tag, 'x'), num(tag, 'y'), num(tag, 'width'), num(tag, 'height'), s));
    } else if (kind === 'circle') {
      const r = num(tag, 'r');
      elements.push(baseElement('ellipse', num(tag, 'cx') - r, num(tag, 'cy') - r, r * 2, r * 2, s));
    } else if (kind === 'ellipse') {
      const rx = num(tag, 'rx');
      const ry = num(tag, 'ry');
      elements.push(baseElement('ellipse', num(tag, 'cx') - rx, num(tag, 'cy') - ry, rx * 2, ry * 2, s));
    } else if (kind === 'line') {
      const x1 = num(tag, 'x1');
      const y1 = num(tag, 'y1');
      const x2 = num(tag, 'x2');
      const y2 = num(tag, 'y2');
      const el: any = baseElement('line', Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1), s);
      el.points = [
        [0, 0],
        [x2 - x1, y2 - y1],
      ];
      elements.push(el);
    } else if (kind === 'text') {
      const inner = (tag.match(/>([\s\S]*?)<\/text>/) || [])[1] || '';
      const text = inner.replace(/<[^>]+>/g, '').trim();
      const el: any = baseElement('text', num(tag, 'x'), num(tag, 'y'), Math.max(20, text.length * 8), 20, s);
      el.text = text;
      el.fontSize = num(tag, 'font-size', 16);
      el.fontFamily = 1;
      el.textAlign = 'left';
      el.verticalAlign = 'top';
      el.strokeColor = s.fill && s.fill !== 'none' ? s.fill : '#1e1e1e';
      elements.push(el);
    } else {
      skipped++;
    }
  }
  return { elements, skipped };
}

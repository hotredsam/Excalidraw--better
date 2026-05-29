/** 2D geometry helpers for canvas math (pure, dependency-free). */

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function centerOf(box: Box): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function pointInBox(p: Point, box: Box): boolean {
  return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}

export function expandBox(box: Box, padding: number): Box {
  return { x: box.x - padding, y: box.y - padding, width: box.width + padding * 2, height: box.height + padding * 2 };
}

export function translateBox(box: Box, dx: number, dy: number): Box {
  return { ...box, x: box.x + dx, y: box.y + dy };
}

/** Normalize a rect that may have negative width/height into a positive Box. */
export function normalizeRect(x1: number, y1: number, x2: number, y2: number): Box {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function boxesIntersect(a: Box, b: Box): boolean {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

/** Union bounding box of elements that expose x/y/width/height. */
export function boundingBox(elements: Array<Partial<Box>>): Box | null {
  const valid = elements.filter((e) => typeof e.x === 'number' && typeof e.y === 'number');
  if (valid.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const e of valid) {
    const x = e.x as number;
    const y = e.y as number;
    const w = e.width ?? 0;
    const h = e.height ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function clampPointToBox(p: Point, box: Box): Point {
  return {
    x: Math.min(Math.max(p.x, box.x), box.x + box.width),
    y: Math.min(Math.max(p.y, box.y), box.y + box.height),
  };
}

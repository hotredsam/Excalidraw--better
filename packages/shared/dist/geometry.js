"use strict";
/** 2D geometry helpers for canvas math (pure, dependency-free). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.distance = distance;
exports.centerOf = centerOf;
exports.pointInBox = pointInBox;
exports.expandBox = expandBox;
exports.translateBox = translateBox;
exports.normalizeRect = normalizeRect;
exports.boxesIntersect = boxesIntersect;
exports.boundingBox = boundingBox;
exports.clampPointToBox = clampPointToBox;
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
function centerOf(box) {
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
function pointInBox(p, box) {
    return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}
function expandBox(box, padding) {
    return { x: box.x - padding, y: box.y - padding, width: box.width + padding * 2, height: box.height + padding * 2 };
}
function translateBox(box, dx, dy) {
    return { ...box, x: box.x + dx, y: box.y + dy };
}
/** Normalize a rect that may have negative width/height into a positive Box. */
function normalizeRect(x1, y1, x2, y2) {
    return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
    };
}
function boxesIntersect(a, b) {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}
/** Union bounding box of elements that expose x/y/width/height. */
function boundingBox(elements) {
    const valid = elements.filter((e) => typeof e.x === 'number' && typeof e.y === 'number');
    if (valid.length === 0)
        return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const e of valid) {
        const x = e.x;
        const y = e.y;
        const w = e.width ?? 0;
        const h = e.height ?? 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
function clampPointToBox(p, box) {
    return {
        x: Math.min(Math.max(p.x, box.x), box.x + box.width),
        y: Math.min(Math.max(p.y, box.y), box.y + box.height),
    };
}

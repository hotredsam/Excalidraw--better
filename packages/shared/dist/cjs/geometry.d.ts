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
export declare function distance(a: Point, b: Point): number;
export declare function centerOf(box: Box): Point;
export declare function pointInBox(p: Point, box: Box): boolean;
export declare function expandBox(box: Box, padding: number): Box;
export declare function translateBox(box: Box, dx: number, dy: number): Box;
/** Normalize a rect that may have negative width/height into a positive Box. */
export declare function normalizeRect(x1: number, y1: number, x2: number, y2: number): Box;
export declare function boxesIntersect(a: Box, b: Box): boolean;
/** Union bounding box of elements that expose x/y/width/height. */
export declare function boundingBox(elements: Array<Partial<Box>>): Box | null;
export declare function clampPointToBox(p: Point, box: Box): Point;

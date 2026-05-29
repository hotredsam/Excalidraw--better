"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTagsSchema = exports.SearchResultListSchema = exports.SearchResultSchema = void 0;
exports.extractSceneText = extractSceneText;
const zod_1 = require("zod");
exports.SearchResultSchema = zod_1.z.object({
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    extension: zod_1.z.string(),
    mtime: zod_1.z.number(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    /** Short snippet of matching embedded text, if any. */
    snippet: zod_1.z.string().optional(),
    /** Which fields matched: name | tag | text. */
    matchedOn: zod_1.z.array(zod_1.z.enum(['name', 'tag', 'text'])).default([]),
});
exports.SearchResultListSchema = zod_1.z.object({
    results: zod_1.z.array(exports.SearchResultSchema),
    /** Total files in the index when this query ran. */
    indexed: zod_1.z.number(),
});
exports.FileTagsSchema = zod_1.z.record(zod_1.z.array(zod_1.z.string()));
/** Extract searchable text from the elements of an Excalidraw scene. */
function extractSceneText(scene) {
    if (!scene || !Array.isArray(scene.elements))
        return '';
    return scene.elements
        .map((el) => (typeof el?.text === 'string' ? el.text : ''))
        .filter(Boolean)
        .join(' ');
}

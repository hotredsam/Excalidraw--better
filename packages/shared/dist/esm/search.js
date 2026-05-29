import { z } from 'zod';
export const SearchResultSchema = z.object({
    name: z.string(),
    path: z.string(),
    extension: z.string(),
    mtime: z.number(),
    tags: z.array(z.string()).default([]),
    /** Short snippet of matching embedded text, if any. */
    snippet: z.string().optional(),
    /** Which fields matched: name | tag | text. */
    matchedOn: z.array(z.enum(['name', 'tag', 'text'])).default([]),
});
export const SearchResultListSchema = z.object({
    results: z.array(SearchResultSchema),
    /** Total files in the index when this query ran. */
    indexed: z.number(),
});
export const FileTagsSchema = z.record(z.array(z.string()));
/** Extract searchable text from the elements of an Excalidraw scene. */
export function extractSceneText(scene) {
    if (!scene || !Array.isArray(scene.elements))
        return '';
    return scene.elements
        .map((el) => (typeof el?.text === 'string' ? el.text : ''))
        .filter(Boolean)
        .join(' ');
}

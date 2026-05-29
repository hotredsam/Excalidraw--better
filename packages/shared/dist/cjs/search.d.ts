import { z } from 'zod';
export declare const SearchResultSchema: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    extension: z.ZodString;
    mtime: z.ZodNumber;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Short snippet of matching embedded text, if any. */
    snippet: z.ZodOptional<z.ZodString>;
    /** Which fields matched: name | tag | text. */
    matchedOn: z.ZodDefault<z.ZodArray<z.ZodEnum<["name", "tag", "text"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    name: string;
    tags: string[];
    mtime: number;
    extension: string;
    matchedOn: ("name" | "tag" | "text")[];
    snippet?: string | undefined;
}, {
    path: string;
    name: string;
    mtime: number;
    extension: string;
    tags?: string[] | undefined;
    snippet?: string | undefined;
    matchedOn?: ("name" | "tag" | "text")[] | undefined;
}>;
export declare const SearchResultListSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        extension: z.ZodString;
        mtime: z.ZodNumber;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Short snippet of matching embedded text, if any. */
        snippet: z.ZodOptional<z.ZodString>;
        /** Which fields matched: name | tag | text. */
        matchedOn: z.ZodDefault<z.ZodArray<z.ZodEnum<["name", "tag", "text"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        name: string;
        tags: string[];
        mtime: number;
        extension: string;
        matchedOn: ("name" | "tag" | "text")[];
        snippet?: string | undefined;
    }, {
        path: string;
        name: string;
        mtime: number;
        extension: string;
        tags?: string[] | undefined;
        snippet?: string | undefined;
        matchedOn?: ("name" | "tag" | "text")[] | undefined;
    }>, "many">;
    /** Total files in the index when this query ran. */
    indexed: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    results: {
        path: string;
        name: string;
        tags: string[];
        mtime: number;
        extension: string;
        matchedOn: ("name" | "tag" | "text")[];
        snippet?: string | undefined;
    }[];
    indexed: number;
}, {
    results: {
        path: string;
        name: string;
        mtime: number;
        extension: string;
        tags?: string[] | undefined;
        snippet?: string | undefined;
        matchedOn?: ("name" | "tag" | "text")[] | undefined;
    }[];
    indexed: number;
}>;
export declare const FileTagsSchema: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResultList = z.infer<typeof SearchResultListSchema>;
export type FileTags = z.infer<typeof FileTagsSchema>;
/** Extract searchable text from the elements of an Excalidraw scene. */
export declare function extractSceneText(scene: any): string;

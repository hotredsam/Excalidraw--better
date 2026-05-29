import { Slide, GitStatus, Command, MarkdownOptions } from './features';
export interface RenameContext {
    name: string;
    ext: string;
    n: number;
    padWidth?: number;
    date?: Date;
}
/**
 * Expand a rename template. Supported tokens:
 *   {name} {ext} {n} {date} {time} {YYYY} {MM} {DD}
 */
export declare function applyRenameTemplate(template: string, ctx: RenameContext): string;
/**
 * Extract slides from a scene's frame elements, ordered left-to-right then
 * top-to-bottom (reading order). If there are no frames, returns a single
 * slide covering the whole content bounding box.
 */
export declare function extractSlidesFromScene(scene: any): Slide[];
export declare function buildMarkdown(opts: MarkdownOptions, imageRelPath: string, bodyText?: string): string;
/** Parse the output of `git status --porcelain=v1 -b`. */
export declare function parseGitStatus(porcelain: string): GitStatus;
/** Subsequence fuzzy match returning a score (higher = better) or -1. */
export declare function fuzzyScore(query: string, text: string): number;
export declare function filterCommands(commands: Command[], query: string): Command[];

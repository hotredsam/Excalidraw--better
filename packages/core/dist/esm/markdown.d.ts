import { MarkdownOptions } from '@excalibur/shared';
/**
 * Markdown embed/export: writes a rendered image into `<workspace>/exports/` and
 * a sibling `.md` file that references it (relative path), optionally with
 * YAML frontmatter — handy for vault systems (Obsidian-style).
 */
export interface MarkdownBundle {
    imagePath: string;
    markdownPath: string;
}
export declare function markdownPaths(workspacePath: string, baseName: string, imageFormat: 'png' | 'svg'): MarkdownBundle;
export declare function writeMarkdownBundle(workspacePath: string, baseName: string, opts: MarkdownOptions, imageData: string, scene: unknown, bodyText?: string): Promise<MarkdownBundle>;

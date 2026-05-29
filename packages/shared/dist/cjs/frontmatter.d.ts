/**
 * Minimal YAML-frontmatter parser/serializer (no external deps). Supports the
 * subset used by Excalibur's markdown export: scalar strings/numbers/booleans
 * and simple inline arrays (`tags: ["a", "b"]`). Good enough for vault-style
 * round-tripping; not a full YAML implementation.
 */
export interface Frontmatter {
    data: Record<string, any>;
    body: string;
}
export declare function parseFrontmatter(text: string): Frontmatter;
export declare function stringifyFrontmatter(data: Record<string, any>, body?: string): string;

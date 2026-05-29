import { Snippet, SnippetSummary } from '@excalibur/shared';
/**
 * Per-profile snippet library: small reusable groups of elements that can be
 * quick-inserted onto the canvas. Stored under `<profile>/snippets/<id>.json`.
 */
export declare class SnippetStore {
    private dir;
    constructor(profileDir: string);
    init(): Promise<void>;
    private fileFor;
    list(): Promise<SnippetSummary[]>;
    get(id: string): Promise<Snippet>;
    save(input: {
        id?: string;
        title: string;
        description?: string;
        tags?: string[];
        elements: any[];
    }): Promise<SnippetSummary>;
    remove(id: string): Promise<void>;
    rename(id: string, title: string): Promise<SnippetSummary>;
}

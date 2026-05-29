import { StoredTemplate, TemplateSummary } from '@excalibur/shared';
/**
 * Per-profile template store. Templates are `.json` scenes living under
 * `<profile>/templates/`. The Templates first-party plugin and the AI Import
 * Lane both populate this folder; the UI lets users insert a template as a new
 * drawing or save the current canvas as a template.
 */
export declare class TemplateStore {
    private dir;
    constructor(profileDir: string);
    init(): Promise<void>;
    list(): Promise<TemplateSummary[]>;
    get(id: string): Promise<StoredTemplate>;
    save(input: {
        id?: string;
        title: string;
        description?: string;
        tags?: string[];
        scene: any;
    }): Promise<TemplateSummary>;
}

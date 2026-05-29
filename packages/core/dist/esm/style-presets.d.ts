import { StylePreset } from '@excalibur/shared';
/**
 * Per-profile element-style presets, stored at
 * `<profile>/settings/style-presets.json`.
 */
export declare class StylePresetStore {
    private file;
    private presets;
    constructor(profileDir: string);
    init(): Promise<void>;
    list(): StylePreset[];
    save(input: Omit<StylePreset, 'id'> & {
        id?: string;
    }): Promise<StylePreset>;
    remove(id: string): Promise<void>;
    private persist;
}

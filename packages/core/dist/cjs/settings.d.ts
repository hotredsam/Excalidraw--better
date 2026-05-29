import { Settings } from '@excalibur/shared';
export declare class SettingsStore {
    private settingsFile;
    private settings;
    constructor(profileDir: string);
    init(): Promise<void>;
    get(): Settings;
    update(partial: Partial<Settings>): Promise<Settings>;
    private save;
}

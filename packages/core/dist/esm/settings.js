import * as path from 'path';
import * as fs from 'fs-extra';
import { SettingsSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';
export class SettingsStore {
    settingsFile;
    settings = SettingsSchema.parse({});
    constructor(profileDir) {
        this.settingsFile = path.join(profileDir, 'settings', 'settings.json');
    }
    async init() {
        if (await fs.pathExists(this.settingsFile)) {
            const data = await fs.readJson(this.settingsFile);
            this.settings = SettingsSchema.parse(data);
        }
        else {
            await this.save();
        }
    }
    get() {
        return this.settings;
    }
    async update(partial) {
        this.settings = SettingsSchema.parse({
            ...this.settings,
            ...partial,
        });
        await this.save();
        return this.settings;
    }
    async save() {
        await writeJsonAtomic(this.settingsFile, this.settings);
    }
}

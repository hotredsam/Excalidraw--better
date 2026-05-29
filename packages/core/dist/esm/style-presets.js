import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { StylePresetListSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';
/**
 * Per-profile element-style presets, stored at
 * `<profile>/settings/style-presets.json`.
 */
export class StylePresetStore {
    file;
    presets = [];
    constructor(profileDir) {
        this.file = path.join(profileDir, 'settings', 'style-presets.json');
    }
    async init() {
        if (await fs.pathExists(this.file)) {
            try {
                this.presets = StylePresetListSchema.parse(await fs.readJson(this.file)).presets;
            }
            catch {
                this.presets = [];
            }
        }
    }
    list() {
        return this.presets;
    }
    async save(input) {
        const id = input.id || nanoid(8);
        const preset = { ...input, id };
        this.presets = [...this.presets.filter((p) => p.id !== id), preset];
        await this.persist();
        return preset;
    }
    async remove(id) {
        this.presets = this.presets.filter((p) => p.id !== id);
        await this.persist();
    }
    async persist() {
        await writeJsonAtomic(this.file, StylePresetListSchema.parse({ presets: this.presets }));
    }
}

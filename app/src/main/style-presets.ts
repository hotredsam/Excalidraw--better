import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { StylePreset, StylePresetListSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

/**
 * Per-profile element-style presets, stored at
 * `<profile>/settings/style-presets.json`.
 */
export class StylePresetStore {
  private file: string;
  private presets: StylePreset[] = [];

  constructor(profileDir: string) {
    this.file = path.join(profileDir, 'settings', 'style-presets.json');
  }

  async init() {
    if (await fs.pathExists(this.file)) {
      try {
        this.presets = StylePresetListSchema.parse(await fs.readJson(this.file)).presets;
      } catch {
        this.presets = [];
      }
    }
  }

  list(): StylePreset[] {
    return this.presets;
  }

  async save(input: Omit<StylePreset, 'id'> & { id?: string }): Promise<StylePreset> {
    const id = input.id || nanoid(8);
    const preset = { ...input, id } as StylePreset;
    this.presets = [...this.presets.filter((p) => p.id !== id), preset];
    await this.persist();
    return preset;
  }

  async remove(id: string): Promise<void> {
    this.presets = this.presets.filter((p) => p.id !== id);
    await this.persist();
  }

  private async persist() {
    await writeJsonAtomic(this.file, StylePresetListSchema.parse({ presets: this.presets }));
  }
}

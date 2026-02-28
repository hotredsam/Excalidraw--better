import * as path from 'path';
import * as fs from 'fs-extra';
import { Settings, SettingsSchema } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';

export class SettingsStore {
  private settingsFile: string;
  private settings: Settings = SettingsSchema.parse({});

  constructor(profileDir: string) {
    this.settingsFile = path.join(profileDir, 'settings', 'settings.json');
  }

  async init() {
    if (await fs.pathExists(this.settingsFile)) {
      const data = await fs.readJson(this.settingsFile);
      this.settings = SettingsSchema.parse(data);
    } else {
      await this.save();
    }
  }

  get(): Settings {
    return this.settings;
  }

  async update(partial: Partial<Settings>): Promise<Settings> {
    this.settings = SettingsSchema.parse({
      ...this.settings,
      ...partial,
    });
    await this.save();
    return this.settings;
  }

  private async save() {
    await writeJsonAtomic(this.settingsFile, this.settings);
  }
}

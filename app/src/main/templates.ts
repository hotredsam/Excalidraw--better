import * as path from 'path';
import * as fs from 'fs-extra';
import {
  StoredTemplate,
  StoredTemplateSchema,
  TemplateSummary,
} from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { writeJsonAtomic } from './fs-utils';

/**
 * Per-profile template store. Templates are `.json` scenes living under
 * `<profile>/templates/`. The Templates first-party plugin and the AI Import
 * Lane both populate this folder; the UI lets users insert a template as a new
 * drawing or save the current canvas as a template.
 */
export class TemplateStore {
  private dir: string;

  constructor(profileDir: string) {
    this.dir = path.join(profileDir, 'templates');
  }

  async init() {
    await fs.ensureDir(this.dir);
  }

  async list(): Promise<TemplateSummary[]> {
    await this.init();
    const items = await fs.readdir(this.dir);
    const out: TemplateSummary[] = [];
    for (const file of items) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readJson(path.join(this.dir, file));
        const tpl = StoredTemplateSchema.parse(raw);
        out.push({ id: tpl.id, title: tpl.title, description: tpl.description, tags: tpl.tags });
      } catch {
        // skip malformed template
      }
    }
    return out.sort((a, b) => a.title.localeCompare(b.title));
  }

  async get(id: string): Promise<StoredTemplate> {
    const file = path.join(this.dir, `${sanitizeName(id)}.json`);
    if (!(await fs.pathExists(file))) throw new Error(`Template "${id}" not found`);
    return StoredTemplateSchema.parse(await fs.readJson(file));
  }

  async save(input: { id?: string; title: string; description?: string; tags?: string[]; scene: any }): Promise<TemplateSummary> {
    await this.init();
    const id = sanitizeName(input.id || input.title).toLowerCase().replace(/\s+/g, '-');
    const tpl: StoredTemplate = StoredTemplateSchema.parse({
      id,
      title: input.title,
      description: input.description || '',
      tags: input.tags || [],
      scene: input.scene || {},
    });
    await writeJsonAtomic(path.join(this.dir, `${id}.json`), tpl);
    return { id: tpl.id, title: tpl.title, description: tpl.description, tags: tpl.tags };
  }
}

import * as path from 'path';
import * as fs from 'fs-extra';
import { app } from 'electron';
import { AiPayloadSchema, AiPayload } from '@excalibur/shared';
import { APPDATA_DIR } from '@excalibur/shared';

export interface AiValidateResult {
  valid: boolean;
  type?: string;
  payload?: AiPayload;
  errors?: string[];
}

export interface AiApplyResult {
  success: boolean;
  message: string;
}

export class AiImporter {
  private profileDir: string;

  constructor(profileDir: string) {
    this.profileDir = profileDir;
  }

  validate(content: string): AiValidateResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { valid: false, errors: ['Invalid JSON: could not parse content'] };
    }

    const result = AiPayloadSchema.safeParse(parsed);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }

    return { valid: true, type: result.data.type, payload: result.data };
  }

  async apply(rawPayload: unknown): Promise<AiApplyResult> {
    const parseResult = AiPayloadSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      return { success: false, message: `Invalid payload: ${parseResult.error.errors.map(e => e.message).join(', ')}` };
    }
    const payload: AiPayload = parseResult.data;

    switch (payload.type) {
      case 'plugin_scaffold': {
        const pluginsBase = path.resolve(path.join(this.profileDir, 'plugins'));
        const pluginDir = path.resolve(path.join(pluginsBase, payload.id));
        if (!pluginDir.startsWith(pluginsBase + path.sep) && pluginDir !== pluginsBase) {
          return { success: false, message: 'Invalid plugin id: path traversal detected' };
        }
        await fs.ensureDir(pluginDir);

        const manifest = {
          id: payload.id,
          name: payload.name,
          version: payload.version,
          description: payload.description,
          entry: payload.entry,
          ...(payload.manifest || {}),
        };
        await fs.writeJson(path.join(pluginDir, 'manifest.json'), manifest, { spaces: 2 });
        await fs.writeFile(path.join(pluginDir, payload.entry), payload.code, 'utf-8');

        return { success: true, message: `Plugin "${payload.name}" installed to ${pluginDir}` };
      }

      case 'template_pack': {
        const templatesDir = path.join(this.profileDir, 'templates');
        await fs.ensureDir(templatesDir);
        for (const tpl of payload.templates) {
          const safeName = tpl.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          await fs.writeFile(path.join(templatesDir, safeName + '.excalidraw'), tpl.content, 'utf-8');
        }
        return { success: true, message: `${payload.templates.length} template(s) installed` };
      }

      case 'settings_bundle': {
        // Settings are applied by returning them to the caller to merge into SettingsStore
        // We don't apply here; just signal success so main.ts can call settingsStore.update()
        return { success: true, message: 'Settings bundle validated - ready to apply' };
      }

      case 'docs_update': {
        const docsDir = path.resolve(path.join(app.getPath('userData'), 'docs'));
        await fs.ensureDir(docsDir);
        // payload.filename is already validated by schema regex to only contain safe chars
        const destPath = path.resolve(path.join(docsDir, payload.filename));
        if (!destPath.startsWith(docsDir + path.sep) && destPath !== docsDir) {
          return { success: false, message: 'Invalid filename: path traversal detected' };
        }
        await fs.writeFile(destPath, payload.content, 'utf-8');
        return { success: true, message: `Docs file "${payload.filename}" saved` };
      }

      default:
        return { success: false, message: 'Unknown payload type' };
    }
  }
}

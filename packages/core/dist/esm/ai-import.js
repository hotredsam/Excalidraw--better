import * as path from 'path';
import * as fs from 'fs-extra';
import { PluginManifestSchema, } from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { writeJsonAtomic } from './fs-utils';
/**
 * Applies a *validated* AI-import payload within a profile boundary. All writes
 * are confined to the profile directory (plugins/, templates/, settings/,
 * docs/); nothing escapes via traversal because names are sanitized first.
 */
export async function applyAiPayload(profileDir, payload, applySettings) {
    switch (payload.type) {
        case 'settings_bundle': {
            if (applySettings)
                await applySettings(payload.settings);
            return {
                ok: true,
                type: 'settings_bundle',
                message: `Applied settings bundle "${payload.name}".`,
                changes: ['settings/settings.json'],
            };
        }
        case 'template_pack': {
            const dir = path.join(profileDir, 'templates');
            await fs.ensureDir(dir);
            const changes = [];
            for (const tpl of payload.templates) {
                const id = sanitizeName(tpl.id || tpl.title);
                const file = path.join(dir, `${id}.json`);
                const scene = tpl.scene ?? {
                    type: 'excalidraw',
                    version: 2,
                    source: 'excalibur-template',
                    elements: [],
                    appState: {},
                    files: {},
                };
                await writeJsonAtomic(file, {
                    id,
                    title: tpl.title,
                    description: tpl.description,
                    tags: tpl.tags,
                    scene,
                });
                changes.push(`templates/${id}.json`);
            }
            return {
                ok: true,
                type: 'template_pack',
                message: `Installed ${payload.templates.length} template(s) from "${payload.name}".`,
                changes,
            };
        }
        case 'plugin_scaffold': {
            const id = sanitizeName(payload.name).toLowerCase().replace(/\s+/g, '-');
            const dir = path.join(profileDir, 'plugins', id);
            await fs.ensureDir(dir);
            const manifest = PluginManifestSchema.parse({
                id,
                name: payload.name,
                version: payload.version,
                description: payload.description,
                author: 'AI Import',
                permissions: payload.permissions,
                contributes: {
                    panels: [
                        {
                            id: `${id}-about`,
                            title: payload.name,
                            body: `**${payload.name}** (scaffolded by AI Import)\n\n` +
                                payload.description +
                                '\n\n### Planned features\n' +
                                payload.features.map((f) => `- ${f}`).join('\n'),
                        },
                    ],
                    commands: payload.features.slice(0, 8).map((f, i) => ({
                        id: `${id}-cmd-${i}`,
                        title: f,
                    })),
                },
            });
            await writeJsonAtomic(path.join(dir, 'plugin.json'), manifest);
            await fs.writeFile(path.join(dir, 'README.md'), `# ${payload.name}\n\n${payload.description}\n\n` +
                `Scaffolded by the Excalibur AI Import Lane.\n\n` +
                `## Permissions\n- filesystem: ${payload.permissions.filesystem}\n- network: ${payload.permissions.network}\n\n` +
                `## Features\n${payload.features.map((f) => `- ${f}`).join('\n')}\n` +
                (payload.notes ? `\n## Notes\n${payload.notes}\n` : ''), 'utf-8');
            return {
                ok: true,
                type: 'plugin_scaffold',
                message: `Scaffolded plugin "${payload.name}" (id: ${id}). Enable it in the Plugins panel.`,
                changes: [`plugins/${id}/plugin.json`, `plugins/${id}/README.md`],
            };
        }
        case 'docs_update': {
            const dir = path.join(profileDir, 'docs');
            await fs.ensureDir(dir);
            const base = sanitizeName(path.basename(payload.target)) || 'doc';
            const file = path.join(dir, base.endsWith('.md') ? base : `${base}.md`);
            const header = `<!-- Proposed by Excalibur AI Import for ${payload.target} -->\n\n`;
            await fs.writeFile(file, header + payload.change + '\n', 'utf-8');
            return {
                ok: true,
                type: 'docs_update',
                message: `Wrote proposed docs update to profile docs/${path.basename(file)}.`,
                changes: [`docs/${path.basename(file)}`],
            };
        }
    }
}

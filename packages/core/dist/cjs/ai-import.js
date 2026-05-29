"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAiPayload = applyAiPayload;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
const fs_utils_1 = require("./fs-utils");
/**
 * Applies a *validated* AI-import payload within a profile boundary. All writes
 * are confined to the profile directory (plugins/, templates/, settings/,
 * docs/); nothing escapes via traversal because names are sanitized first.
 */
async function applyAiPayload(profileDir, payload, applySettings) {
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
                const id = (0, path_utils_1.sanitizeName)(tpl.id || tpl.title);
                const file = path.join(dir, `${id}.json`);
                const scene = tpl.scene ?? {
                    type: 'excalidraw',
                    version: 2,
                    source: 'excalibur-template',
                    elements: [],
                    appState: {},
                    files: {},
                };
                await (0, fs_utils_1.writeJsonAtomic)(file, {
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
            const id = (0, path_utils_1.sanitizeName)(payload.name).toLowerCase().replace(/\s+/g, '-');
            const dir = path.join(profileDir, 'plugins', id);
            await fs.ensureDir(dir);
            const manifest = shared_1.PluginManifestSchema.parse({
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
            await (0, fs_utils_1.writeJsonAtomic)(path.join(dir, 'plugin.json'), manifest);
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
            const base = (0, path_utils_1.sanitizeName)(path.basename(payload.target)) || 'doc';
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

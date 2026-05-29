import { z } from 'zod';
import { PluginPermissionsSchema } from './plugins';
import { SettingsSchema } from './settings-schema';
/**
 * AI Import Lane payload schemas.
 *
 * Excalibur accepts AI-generated payloads (JSON or a simple `KEY: value` text
 * format) that extend the app: plugin scaffolds, template packs, settings
 * bundles, and documentation updates. Every payload is parsed, type-detected,
 * and validated against these schemas before the user is shown a preview/diff
 * and asked to confirm application.
 */
export const AI_PAYLOAD_TYPES = [
    'plugin_scaffold',
    'template_pack',
    'settings_bundle',
    'docs_update',
];
export const TemplateEntrySchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    /** Optional inline Excalidraw scene; if omitted a blank scene is created. */
    scene: z.record(z.any()).optional(),
});
export const PluginScaffoldPayloadSchema = z.object({
    type: z.literal('plugin_scaffold'),
    name: z.string().min(1),
    version: z.string().default('0.1.0'),
    description: z.string().default(''),
    permissions: PluginPermissionsSchema.default({}),
    features: z.array(z.string()).default([]),
    notes: z.string().optional(),
});
export const TemplatePackPayloadSchema = z.object({
    type: z.literal('template_pack'),
    name: z.string().min(1),
    version: z.string().default('1.0.0'),
    templates: z.array(TemplateEntrySchema).min(1),
});
export const SettingsBundlePayloadSchema = z.object({
    type: z.literal('settings_bundle'),
    name: z.string().min(1),
    version: z.string().default('1.0.0'),
    applyTo: z.enum(['current_profile']).default('current_profile'),
    settings: SettingsSchema.partial(),
});
export const DocsUpdatePayloadSchema = z.object({
    type: z.literal('docs_update'),
    target: z.string().min(1),
    /** Free-form description of the change, or the full new content. */
    change: z.string().min(1),
});
export const AiPayloadSchema = z.discriminatedUnion('type', [
    PluginScaffoldPayloadSchema,
    TemplatePackPayloadSchema,
    SettingsBundlePayloadSchema,
    DocsUpdatePayloadSchema,
]);
/**
 * Parse the lightweight `KEY: value` text format used in some AI samples into a
 * structured object. Indented lines become nested key/values; bullet lists
 * (`- item`) accumulate into arrays under the preceding key.
 */
export function parseTextPayload(text) {
    const lines = text.split(/\r?\n/);
    const result = {};
    let currentListKey = null;
    let nestedKey = null;
    for (const raw of lines) {
        if (!raw.trim()) {
            currentListKey = null;
            continue;
        }
        const bullet = raw.match(/^\s*-\s+(.*)$/);
        if (bullet && currentListKey) {
            result[currentListKey].push(bullet[1].trim());
            continue;
        }
        const indented = /^\s+/.test(raw);
        const kv = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_ -]*):\s*(.*)$/);
        if (kv) {
            const key = kv[1].trim().toLowerCase().replace(/\s+/g, '_');
            const value = kv[2].trim();
            if (indented && nestedKey) {
                // e.g. "  filesystem: workspace-only" under PERMISSIONS
                if (typeof result[nestedKey] !== 'object' || Array.isArray(result[nestedKey])) {
                    result[nestedKey] = {};
                }
                result[nestedKey][key] = value;
                continue;
            }
            if (value === '') {
                // A header that introduces a list or nested block.
                result[key] = [];
                currentListKey = key;
                nestedKey = key;
            }
            else {
                result[key] = value;
                currentListKey = null;
                nestedKey = key;
            }
        }
    }
    return result;
}
/**
 * Convert a raw pasted string (JSON or text format) into a typed Ai payload
 * shape *before* validation. Returns `null` if the type cannot be determined.
 */
export function normalizeRawPayload(raw) {
    const trimmed = raw.trim();
    if (!trimmed)
        return null;
    // JSON path
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const obj = JSON.parse(trimmed);
            return obj && typeof obj === 'object' ? obj : null;
        }
        catch {
            return null;
        }
    }
    // Text "TYPE: x" path
    const parsed = parseTextPayload(trimmed);
    const type = (parsed.type || '').toString();
    if (type === 'plugin_scaffold') {
        return {
            type,
            name: parsed.name,
            version: parsed.version,
            description: parsed.description,
            permissions: parsed.permissions || {},
            features: parsed.features || [],
            notes: parsed.notes,
        };
    }
    if (type === 'docs_update') {
        return {
            type,
            target: parsed.target,
            change: parsed.change || raw,
        };
    }
    // Fallback: return parsed object with whatever type we found.
    return Object.keys(parsed).length ? parsed : null;
}
/** Validate a raw pasted payload and produce a preview-friendly result. */
export function validateRawPayload(raw) {
    const normalized = normalizeRawPayload(raw);
    if (!normalized) {
        return {
            ok: false,
            summary: [],
            errors: ['Could not parse payload as JSON or recognised text format.'],
        };
    }
    if (!AI_PAYLOAD_TYPES.includes(normalized.type)) {
        return {
            ok: false,
            summary: [],
            errors: [
                `Unknown or missing payload "type". Expected one of: ${AI_PAYLOAD_TYPES.join(', ')}.`,
            ],
        };
    }
    const result = AiPayloadSchema.safeParse(normalized);
    if (!result.success) {
        return {
            ok: false,
            type: normalized.type,
            summary: [],
            errors: result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
        };
    }
    return {
        ok: true,
        type: result.data.type,
        payload: result.data,
        summary: summarizePayload(result.data),
        errors: [],
    };
}
export function summarizePayload(payload) {
    switch (payload.type) {
        case 'plugin_scaffold':
            return [
                `Scaffold plugin "${payload.name}" v${payload.version}`,
                `Permissions: filesystem=${payload.permissions.filesystem}, network=${payload.permissions.network}`,
                `${payload.features.length} feature(s) described`,
                'Creates a plugin folder (manifest + README) in this profile.',
            ];
        case 'template_pack':
            return [
                `Template pack "${payload.name}" v${payload.version}`,
                `${payload.templates.length} template(s): ${payload.templates.map((t) => t.title).join(', ')}`,
                'Installs templates into this profile.',
            ];
        case 'settings_bundle':
            return [
                `Settings bundle "${payload.name}" v${payload.version}`,
                `Updates ${Object.keys(payload.settings).length} setting(s) on the current profile.`,
            ];
        case 'docs_update':
            return [`Docs update targeting "${payload.target}"`, 'Writes a proposed doc into this profile.'];
    }
}

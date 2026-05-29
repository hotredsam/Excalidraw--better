"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPayloadSchema = exports.DocsUpdatePayloadSchema = exports.SettingsBundlePayloadSchema = exports.TemplatePackPayloadSchema = exports.PluginScaffoldPayloadSchema = exports.TemplateEntrySchema = exports.AI_PAYLOAD_TYPES = void 0;
exports.parseTextPayload = parseTextPayload;
exports.normalizeRawPayload = normalizeRawPayload;
exports.validateRawPayload = validateRawPayload;
exports.summarizePayload = summarizePayload;
const zod_1 = require("zod");
const plugins_1 = require("./plugins");
const settings_schema_1 = require("./settings-schema");
/**
 * AI Import Lane payload schemas.
 *
 * Excalibur accepts AI-generated payloads (JSON or a simple `KEY: value` text
 * format) that extend the app: plugin scaffolds, template packs, settings
 * bundles, and documentation updates. Every payload is parsed, type-detected,
 * and validated against these schemas before the user is shown a preview/diff
 * and asked to confirm application.
 */
exports.AI_PAYLOAD_TYPES = [
    'plugin_scaffold',
    'template_pack',
    'settings_bundle',
    'docs_update',
];
exports.TemplateEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().default(''),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    /** Optional inline Excalidraw scene; if omitted a blank scene is created. */
    scene: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.PluginScaffoldPayloadSchema = zod_1.z.object({
    type: zod_1.z.literal('plugin_scaffold'),
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().default('0.1.0'),
    description: zod_1.z.string().default(''),
    permissions: plugins_1.PluginPermissionsSchema.default({}),
    features: zod_1.z.array(zod_1.z.string()).default([]),
    notes: zod_1.z.string().optional(),
});
exports.TemplatePackPayloadSchema = zod_1.z.object({
    type: zod_1.z.literal('template_pack'),
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().default('1.0.0'),
    templates: zod_1.z.array(exports.TemplateEntrySchema).min(1),
});
exports.SettingsBundlePayloadSchema = zod_1.z.object({
    type: zod_1.z.literal('settings_bundle'),
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().default('1.0.0'),
    applyTo: zod_1.z.enum(['current_profile']).default('current_profile'),
    settings: settings_schema_1.SettingsSchema.partial(),
});
exports.DocsUpdatePayloadSchema = zod_1.z.object({
    type: zod_1.z.literal('docs_update'),
    target: zod_1.z.string().min(1),
    /** Free-form description of the change, or the full new content. */
    change: zod_1.z.string().min(1),
});
exports.AiPayloadSchema = zod_1.z.discriminatedUnion('type', [
    exports.PluginScaffoldPayloadSchema,
    exports.TemplatePackPayloadSchema,
    exports.SettingsBundlePayloadSchema,
    exports.DocsUpdatePayloadSchema,
]);
/**
 * Parse the lightweight `KEY: value` text format used in some AI samples into a
 * structured object. Indented lines become nested key/values; bullet lists
 * (`- item`) accumulate into arrays under the preceding key.
 */
function parseTextPayload(text) {
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
function normalizeRawPayload(raw) {
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
function validateRawPayload(raw) {
    const normalized = normalizeRawPayload(raw);
    if (!normalized) {
        return {
            ok: false,
            summary: [],
            errors: ['Could not parse payload as JSON or recognised text format.'],
        };
    }
    if (!exports.AI_PAYLOAD_TYPES.includes(normalized.type)) {
        return {
            ok: false,
            summary: [],
            errors: [
                `Unknown or missing payload "type". Expected one of: ${exports.AI_PAYLOAD_TYPES.join(', ')}.`,
            ],
        };
    }
    const result = exports.AiPayloadSchema.safeParse(normalized);
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
function summarizePayload(payload) {
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

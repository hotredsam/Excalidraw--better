import { z } from 'zod';
/**
 * AI Import Lane payload schemas.
 *
 * Excalibur accepts AI-generated payloads (JSON or a simple `KEY: value` text
 * format) that extend the app: plugin scaffolds, template packs, settings
 * bundles, and documentation updates. Every payload is parsed, type-detected,
 * and validated against these schemas before the user is shown a preview/diff
 * and asked to confirm application.
 */
export declare const AI_PAYLOAD_TYPES: readonly ["plugin_scaffold", "template_pack", "settings_bundle", "docs_update"];
export declare const TemplateEntrySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Optional inline Excalidraw scene; if omitted a blank scene is created. */
    scene: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    tags: string[];
    scene?: Record<string, any> | undefined;
}, {
    id: string;
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    scene?: Record<string, any> | undefined;
}>;
export declare const PluginScaffoldPayloadSchema: z.ZodObject<{
    type: z.ZodLiteral<"plugin_scaffold">;
    name: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
    permissions: z.ZodDefault<z.ZodObject<{
        filesystem: z.ZodDefault<z.ZodEnum<["none", "workspace-only", "all"]>>;
        network: z.ZodDefault<z.ZodEnum<["none", "all"]>>;
    }, "strip", z.ZodTypeAny, {
        filesystem: "none" | "workspace-only" | "all";
        network: "none" | "all";
    }, {
        filesystem?: "none" | "workspace-only" | "all" | undefined;
        network?: "none" | "all" | undefined;
    }>>;
    features: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "plugin_scaffold";
    name: string;
    version: string;
    description: string;
    permissions: {
        filesystem: "none" | "workspace-only" | "all";
        network: "none" | "all";
    };
    features: string[];
    notes?: string | undefined;
}, {
    type: "plugin_scaffold";
    name: string;
    version?: string | undefined;
    description?: string | undefined;
    permissions?: {
        filesystem?: "none" | "workspace-only" | "all" | undefined;
        network?: "none" | "all" | undefined;
    } | undefined;
    features?: string[] | undefined;
    notes?: string | undefined;
}>;
export declare const TemplatePackPayloadSchema: z.ZodObject<{
    type: z.ZodLiteral<"template_pack">;
    name: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    templates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Optional inline Excalidraw scene; if omitted a blank scene is created. */
        scene: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        tags: string[];
        scene?: Record<string, any> | undefined;
    }, {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        scene?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "template_pack";
    name: string;
    version: string;
    templates: {
        id: string;
        title: string;
        description: string;
        tags: string[];
        scene?: Record<string, any> | undefined;
    }[];
}, {
    type: "template_pack";
    name: string;
    templates: {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        scene?: Record<string, any> | undefined;
    }[];
    version?: string | undefined;
}>;
export declare const SettingsBundlePayloadSchema: z.ZodObject<{
    type: z.ZodLiteral<"settings_bundle">;
    name: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    applyTo: z.ZodDefault<z.ZodEnum<["current_profile"]>>;
    settings: z.ZodObject<{
        autosave: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        autosaveIntervalSeconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        showGrid: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        theme: z.ZodOptional<z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>>;
        defaultExportFormat: z.ZodOptional<z.ZodDefault<z.ZodEnum<["png", "svg"]>>>;
        confirmOnDelete: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        recentsLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        keepBackups: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        backupsToKeep: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        autoOpenLastWorkspace: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        indexEmbeddedText: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    }, {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "settings_bundle";
    name: string;
    version: string;
    applyTo: "current_profile";
    settings: {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    };
}, {
    type: "settings_bundle";
    name: string;
    settings: {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    };
    version?: string | undefined;
    applyTo?: "current_profile" | undefined;
}>;
export declare const DocsUpdatePayloadSchema: z.ZodObject<{
    type: z.ZodLiteral<"docs_update">;
    target: z.ZodString;
    /** Free-form description of the change, or the full new content. */
    change: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "docs_update";
    target: string;
    change: string;
}, {
    type: "docs_update";
    target: string;
    change: string;
}>;
export declare const AiPayloadSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"plugin_scaffold">;
    name: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
    permissions: z.ZodDefault<z.ZodObject<{
        filesystem: z.ZodDefault<z.ZodEnum<["none", "workspace-only", "all"]>>;
        network: z.ZodDefault<z.ZodEnum<["none", "all"]>>;
    }, "strip", z.ZodTypeAny, {
        filesystem: "none" | "workspace-only" | "all";
        network: "none" | "all";
    }, {
        filesystem?: "none" | "workspace-only" | "all" | undefined;
        network?: "none" | "all" | undefined;
    }>>;
    features: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "plugin_scaffold";
    name: string;
    version: string;
    description: string;
    permissions: {
        filesystem: "none" | "workspace-only" | "all";
        network: "none" | "all";
    };
    features: string[];
    notes?: string | undefined;
}, {
    type: "plugin_scaffold";
    name: string;
    version?: string | undefined;
    description?: string | undefined;
    permissions?: {
        filesystem?: "none" | "workspace-only" | "all" | undefined;
        network?: "none" | "all" | undefined;
    } | undefined;
    features?: string[] | undefined;
    notes?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"template_pack">;
    name: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    templates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Optional inline Excalidraw scene; if omitted a blank scene is created. */
        scene: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        tags: string[];
        scene?: Record<string, any> | undefined;
    }, {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        scene?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "template_pack";
    name: string;
    version: string;
    templates: {
        id: string;
        title: string;
        description: string;
        tags: string[];
        scene?: Record<string, any> | undefined;
    }[];
}, {
    type: "template_pack";
    name: string;
    templates: {
        id: string;
        title: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        scene?: Record<string, any> | undefined;
    }[];
    version?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"settings_bundle">;
    name: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    applyTo: z.ZodDefault<z.ZodEnum<["current_profile"]>>;
    settings: z.ZodObject<{
        autosave: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        autosaveIntervalSeconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        showGrid: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        theme: z.ZodOptional<z.ZodDefault<z.ZodEnum<["dark", "light", "system"]>>>;
        defaultExportFormat: z.ZodOptional<z.ZodDefault<z.ZodEnum<["png", "svg"]>>>;
        confirmOnDelete: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        recentsLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        keepBackups: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        backupsToKeep: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        autoOpenLastWorkspace: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        indexEmbeddedText: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    }, {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "settings_bundle";
    name: string;
    version: string;
    applyTo: "current_profile";
    settings: {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    };
}, {
    type: "settings_bundle";
    name: string;
    settings: {
        autosave?: boolean | undefined;
        autosaveIntervalSeconds?: number | undefined;
        showGrid?: boolean | undefined;
        theme?: "dark" | "light" | "system" | undefined;
        defaultExportFormat?: "png" | "svg" | undefined;
        confirmOnDelete?: boolean | undefined;
        recentsLimit?: number | undefined;
        keepBackups?: boolean | undefined;
        backupsToKeep?: number | undefined;
        autoOpenLastWorkspace?: boolean | undefined;
        indexEmbeddedText?: boolean | undefined;
    };
    version?: string | undefined;
    applyTo?: "current_profile" | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"docs_update">;
    target: z.ZodString;
    /** Free-form description of the change, or the full new content. */
    change: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "docs_update";
    target: string;
    change: string;
}, {
    type: "docs_update";
    target: string;
    change: string;
}>]>;
export type AiPayloadType = (typeof AI_PAYLOAD_TYPES)[number];
export type PluginScaffoldPayload = z.infer<typeof PluginScaffoldPayloadSchema>;
export type TemplatePackPayload = z.infer<typeof TemplatePackPayloadSchema>;
export type SettingsBundlePayload = z.infer<typeof SettingsBundlePayloadSchema>;
export type DocsUpdatePayload = z.infer<typeof DocsUpdatePayloadSchema>;
export type AiPayload = z.infer<typeof AiPayloadSchema>;
export interface AiValidationResult {
    ok: boolean;
    type?: AiPayloadType;
    payload?: AiPayload;
    /** Human-readable summary lines shown in the preview pane. */
    summary: string[];
    errors: string[];
}
export interface AiApplyResult {
    ok: boolean;
    type: AiPayloadType;
    message: string;
    /** Paths created/modified, relative to the profile directory. */
    changes: string[];
}
/**
 * Parse the lightweight `KEY: value` text format used in some AI samples into a
 * structured object. Indented lines become nested key/values; bullet lists
 * (`- item`) accumulate into arrays under the preceding key.
 */
export declare function parseTextPayload(text: string): Record<string, any>;
/**
 * Convert a raw pasted string (JSON or text format) into a typed Ai payload
 * shape *before* validation. Returns `null` if the type cannot be determined.
 */
export declare function normalizeRawPayload(raw: string): Record<string, any> | null;
/** Validate a raw pasted payload and produce a preview-friendly result. */
export declare function validateRawPayload(raw: string): AiValidationResult;
export declare function summarizePayload(payload: AiPayload): string[];

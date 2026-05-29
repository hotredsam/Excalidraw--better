import { z } from 'zod';
/**
 * Plugin permission model. Plugins declare what they need; the host enforces it.
 * Excalibur plugins are *declarative*: a manifest describes contributions
 * (toolbar buttons, commands, panels, export presets) that the host renders and
 * executes through a permission-gated API surface. This keeps the renderer
 * sandbox intact — we never `eval` arbitrary plugin code with full privileges.
 */
export declare const PluginPermissionsSchema: z.ZodObject<{
    filesystem: z.ZodDefault<z.ZodEnum<["none", "workspace-only", "all"]>>;
    network: z.ZodDefault<z.ZodEnum<["none", "all"]>>;
}, "strip", z.ZodTypeAny, {
    filesystem: "none" | "workspace-only" | "all";
    network: "none" | "all";
}, {
    filesystem?: "none" | "workspace-only" | "all" | undefined;
    network?: "none" | "all" | undefined;
}>;
export declare const ExportPresetSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    format: z.ZodEnum<["png", "svg", "json"]>;
    scale: z.ZodDefault<z.ZodNumber>;
    background: z.ZodDefault<z.ZodBoolean>;
    darkMode: z.ZodDefault<z.ZodBoolean>;
    /** Output filename template, e.g. "{name}-{preset}". */
    nameTemplate: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    format: "png" | "svg" | "json";
    scale: number;
    background: boolean;
    darkMode: boolean;
    nameTemplate: string;
}, {
    id: string;
    label: string;
    format: "png" | "svg" | "json";
    scale?: number | undefined;
    background?: boolean | undefined;
    darkMode?: boolean | undefined;
    nameTemplate?: string | undefined;
}>;
export declare const PluginCommandSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    /** Optional keyboard accelerator hint shown in the command palette. */
    accelerator: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    accelerator?: string | undefined;
}, {
    id: string;
    title: string;
    accelerator?: string | undefined;
}>;
export declare const PluginPanelSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    /** Markdown rendered inside the panel (declarative panels only). */
    body: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    body?: string | undefined;
}, {
    id: string;
    title: string;
    body?: string | undefined;
}>;
export declare const PluginContributesSchema: z.ZodObject<{
    toolbar: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        /** Optional keyboard accelerator hint shown in the command palette. */
        accelerator: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }, {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }>, "many">>;
    commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        /** Optional keyboard accelerator hint shown in the command palette. */
        accelerator: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }, {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }>, "many">>;
    panels: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        /** Markdown rendered inside the panel (declarative panels only). */
        body: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        body?: string | undefined;
    }, {
        id: string;
        title: string;
        body?: string | undefined;
    }>, "many">>;
    exportPresets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        format: z.ZodEnum<["png", "svg", "json"]>;
        scale: z.ZodDefault<z.ZodNumber>;
        background: z.ZodDefault<z.ZodBoolean>;
        darkMode: z.ZodDefault<z.ZodBoolean>;
        /** Output filename template, e.g. "{name}-{preset}". */
        nameTemplate: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        format: "png" | "svg" | "json";
        scale: number;
        background: boolean;
        darkMode: boolean;
        nameTemplate: string;
    }, {
        id: string;
        label: string;
        format: "png" | "svg" | "json";
        scale?: number | undefined;
        background?: boolean | undefined;
        darkMode?: boolean | undefined;
        nameTemplate?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    toolbar: {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }[];
    commands: {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }[];
    panels: {
        id: string;
        title: string;
        body?: string | undefined;
    }[];
    exportPresets: {
        id: string;
        label: string;
        format: "png" | "svg" | "json";
        scale: number;
        background: boolean;
        darkMode: boolean;
        nameTemplate: string;
    }[];
}, {
    toolbar?: {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }[] | undefined;
    commands?: {
        id: string;
        title: string;
        accelerator?: string | undefined;
    }[] | undefined;
    panels?: {
        id: string;
        title: string;
        body?: string | undefined;
    }[] | undefined;
    exportPresets?: {
        id: string;
        label: string;
        format: "png" | "svg" | "json";
        scale?: number | undefined;
        background?: boolean | undefined;
        darkMode?: boolean | undefined;
        nameTemplate?: string | undefined;
    }[] | undefined;
}>;
export declare const PluginManifestSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
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
    contributes: z.ZodDefault<z.ZodObject<{
        toolbar: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Optional keyboard accelerator hint shown in the command palette. */
            accelerator: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }>, "many">>;
        commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Optional keyboard accelerator hint shown in the command palette. */
            accelerator: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }>, "many">>;
        panels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Markdown rendered inside the panel (declarative panels only). */
            body: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            body?: string | undefined;
        }, {
            id: string;
            title: string;
            body?: string | undefined;
        }>, "many">>;
        exportPresets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            format: z.ZodEnum<["png", "svg", "json"]>;
            scale: z.ZodDefault<z.ZodNumber>;
            background: z.ZodDefault<z.ZodBoolean>;
            darkMode: z.ZodDefault<z.ZodBoolean>;
            /** Output filename template, e.g. "{name}-{preset}". */
            nameTemplate: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale: number;
            background: boolean;
            darkMode: boolean;
            nameTemplate: string;
        }, {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale?: number | undefined;
            background?: boolean | undefined;
            darkMode?: boolean | undefined;
            nameTemplate?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        toolbar: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        commands: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        panels: {
            id: string;
            title: string;
            body?: string | undefined;
        }[];
        exportPresets: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale: number;
            background: boolean;
            darkMode: boolean;
            nameTemplate: string;
        }[];
    }, {
        toolbar?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        commands?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        panels?: {
            id: string;
            title: string;
            body?: string | undefined;
        }[] | undefined;
        exportPresets?: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale?: number | undefined;
            background?: boolean | undefined;
            darkMode?: boolean | undefined;
            nameTemplate?: string | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    version: string;
    description: string;
    permissions: {
        filesystem: "none" | "workspace-only" | "all";
        network: "none" | "all";
    };
    contributes: {
        toolbar: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        commands: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        panels: {
            id: string;
            title: string;
            body?: string | undefined;
        }[];
        exportPresets: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale: number;
            background: boolean;
            darkMode: boolean;
            nameTemplate: string;
        }[];
    };
    author?: string | undefined;
}, {
    id: string;
    name: string;
    version: string;
    description?: string | undefined;
    author?: string | undefined;
    permissions?: {
        filesystem?: "none" | "workspace-only" | "all" | undefined;
        network?: "none" | "all" | undefined;
    } | undefined;
    contributes?: {
        toolbar?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        commands?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        panels?: {
            id: string;
            title: string;
            body?: string | undefined;
        }[] | undefined;
        exportPresets?: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale?: number | undefined;
            background?: boolean | undefined;
            darkMode?: boolean | undefined;
            nameTemplate?: string | undefined;
        }[] | undefined;
    } | undefined;
}>;
export declare const InstalledPluginSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
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
    contributes: z.ZodDefault<z.ZodObject<{
        toolbar: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Optional keyboard accelerator hint shown in the command palette. */
            accelerator: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }>, "many">>;
        commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Optional keyboard accelerator hint shown in the command palette. */
            accelerator: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }, {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }>, "many">>;
        panels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Markdown rendered inside the panel (declarative panels only). */
            body: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            body?: string | undefined;
        }, {
            id: string;
            title: string;
            body?: string | undefined;
        }>, "many">>;
        exportPresets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            format: z.ZodEnum<["png", "svg", "json"]>;
            scale: z.ZodDefault<z.ZodNumber>;
            background: z.ZodDefault<z.ZodBoolean>;
            darkMode: z.ZodDefault<z.ZodBoolean>;
            /** Output filename template, e.g. "{name}-{preset}". */
            nameTemplate: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale: number;
            background: boolean;
            darkMode: boolean;
            nameTemplate: string;
        }, {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale?: number | undefined;
            background?: boolean | undefined;
            darkMode?: boolean | undefined;
            nameTemplate?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        toolbar: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        commands: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        panels: {
            id: string;
            title: string;
            body?: string | undefined;
        }[];
        exportPresets: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale: number;
            background: boolean;
            darkMode: boolean;
            nameTemplate: string;
        }[];
    }, {
        toolbar?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        commands?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        panels?: {
            id: string;
            title: string;
            body?: string | undefined;
        }[] | undefined;
        exportPresets?: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale?: number | undefined;
            background?: boolean | undefined;
            darkMode?: boolean | undefined;
            nameTemplate?: string | undefined;
        }[] | undefined;
    }>>;
} & {
    enabled: z.ZodDefault<z.ZodBoolean>;
    installedAt: z.ZodNumber;
    /** Whether this plugin shipped with the app (cannot be uninstalled). */
    builtIn: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    version: string;
    description: string;
    permissions: {
        filesystem: "none" | "workspace-only" | "all";
        network: "none" | "all";
    };
    contributes: {
        toolbar: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        commands: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[];
        panels: {
            id: string;
            title: string;
            body?: string | undefined;
        }[];
        exportPresets: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale: number;
            background: boolean;
            darkMode: boolean;
            nameTemplate: string;
        }[];
    };
    enabled: boolean;
    installedAt: number;
    builtIn: boolean;
    author?: string | undefined;
}, {
    id: string;
    name: string;
    version: string;
    installedAt: number;
    description?: string | undefined;
    author?: string | undefined;
    permissions?: {
        filesystem?: "none" | "workspace-only" | "all" | undefined;
        network?: "none" | "all" | undefined;
    } | undefined;
    contributes?: {
        toolbar?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        commands?: {
            id: string;
            title: string;
            accelerator?: string | undefined;
        }[] | undefined;
        panels?: {
            id: string;
            title: string;
            body?: string | undefined;
        }[] | undefined;
        exportPresets?: {
            id: string;
            label: string;
            format: "png" | "svg" | "json";
            scale?: number | undefined;
            background?: boolean | undefined;
            darkMode?: boolean | undefined;
            nameTemplate?: string | undefined;
        }[] | undefined;
    } | undefined;
    enabled?: boolean | undefined;
    builtIn?: boolean | undefined;
}>;
export declare const PluginListSchema: z.ZodObject<{
    plugins: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
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
        contributes: z.ZodDefault<z.ZodObject<{
            toolbar: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                /** Optional keyboard accelerator hint shown in the command palette. */
                accelerator: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }, {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }>, "many">>;
            commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                /** Optional keyboard accelerator hint shown in the command palette. */
                accelerator: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }, {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }>, "many">>;
            panels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                /** Markdown rendered inside the panel (declarative panels only). */
                body: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
                body?: string | undefined;
            }, {
                id: string;
                title: string;
                body?: string | undefined;
            }>, "many">>;
            exportPresets: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                format: z.ZodEnum<["png", "svg", "json"]>;
                scale: z.ZodDefault<z.ZodNumber>;
                background: z.ZodDefault<z.ZodBoolean>;
                darkMode: z.ZodDefault<z.ZodBoolean>;
                /** Output filename template, e.g. "{name}-{preset}". */
                nameTemplate: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale: number;
                background: boolean;
                darkMode: boolean;
                nameTemplate: string;
            }, {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale?: number | undefined;
                background?: boolean | undefined;
                darkMode?: boolean | undefined;
                nameTemplate?: string | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            toolbar: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[];
            commands: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[];
            panels: {
                id: string;
                title: string;
                body?: string | undefined;
            }[];
            exportPresets: {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale: number;
                background: boolean;
                darkMode: boolean;
                nameTemplate: string;
            }[];
        }, {
            toolbar?: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[] | undefined;
            commands?: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[] | undefined;
            panels?: {
                id: string;
                title: string;
                body?: string | undefined;
            }[] | undefined;
            exportPresets?: {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale?: number | undefined;
                background?: boolean | undefined;
                darkMode?: boolean | undefined;
                nameTemplate?: string | undefined;
            }[] | undefined;
        }>>;
    } & {
        enabled: z.ZodDefault<z.ZodBoolean>;
        installedAt: z.ZodNumber;
        /** Whether this plugin shipped with the app (cannot be uninstalled). */
        builtIn: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        version: string;
        description: string;
        permissions: {
            filesystem: "none" | "workspace-only" | "all";
            network: "none" | "all";
        };
        contributes: {
            toolbar: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[];
            commands: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[];
            panels: {
                id: string;
                title: string;
                body?: string | undefined;
            }[];
            exportPresets: {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale: number;
                background: boolean;
                darkMode: boolean;
                nameTemplate: string;
            }[];
        };
        enabled: boolean;
        installedAt: number;
        builtIn: boolean;
        author?: string | undefined;
    }, {
        id: string;
        name: string;
        version: string;
        installedAt: number;
        description?: string | undefined;
        author?: string | undefined;
        permissions?: {
            filesystem?: "none" | "workspace-only" | "all" | undefined;
            network?: "none" | "all" | undefined;
        } | undefined;
        contributes?: {
            toolbar?: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[] | undefined;
            commands?: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[] | undefined;
            panels?: {
                id: string;
                title: string;
                body?: string | undefined;
            }[] | undefined;
            exportPresets?: {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale?: number | undefined;
                background?: boolean | undefined;
                darkMode?: boolean | undefined;
                nameTemplate?: string | undefined;
            }[] | undefined;
        } | undefined;
        enabled?: boolean | undefined;
        builtIn?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    plugins: {
        id: string;
        name: string;
        version: string;
        description: string;
        permissions: {
            filesystem: "none" | "workspace-only" | "all";
            network: "none" | "all";
        };
        contributes: {
            toolbar: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[];
            commands: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[];
            panels: {
                id: string;
                title: string;
                body?: string | undefined;
            }[];
            exportPresets: {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale: number;
                background: boolean;
                darkMode: boolean;
                nameTemplate: string;
            }[];
        };
        enabled: boolean;
        installedAt: number;
        builtIn: boolean;
        author?: string | undefined;
    }[];
}, {
    plugins: {
        id: string;
        name: string;
        version: string;
        installedAt: number;
        description?: string | undefined;
        author?: string | undefined;
        permissions?: {
            filesystem?: "none" | "workspace-only" | "all" | undefined;
            network?: "none" | "all" | undefined;
        } | undefined;
        contributes?: {
            toolbar?: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[] | undefined;
            commands?: {
                id: string;
                title: string;
                accelerator?: string | undefined;
            }[] | undefined;
            panels?: {
                id: string;
                title: string;
                body?: string | undefined;
            }[] | undefined;
            exportPresets?: {
                id: string;
                label: string;
                format: "png" | "svg" | "json";
                scale?: number | undefined;
                background?: boolean | undefined;
                darkMode?: boolean | undefined;
                nameTemplate?: string | undefined;
            }[] | undefined;
        } | undefined;
        enabled?: boolean | undefined;
        builtIn?: boolean | undefined;
    }[];
}>;
export type PluginPermissions = z.infer<typeof PluginPermissionsSchema>;
export type ExportPreset = z.infer<typeof ExportPresetSchema>;
export type PluginCommand = z.infer<typeof PluginCommandSchema>;
export type PluginPanel = z.infer<typeof PluginPanelSchema>;
export type PluginContributes = z.infer<typeof PluginContributesSchema>;
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
export type InstalledPlugin = z.infer<typeof InstalledPluginSchema>;
export type PluginList = z.infer<typeof PluginListSchema>;

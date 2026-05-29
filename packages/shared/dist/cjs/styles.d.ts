import { z } from 'zod';
/**
 * A reusable element style preset (stroke/fill/etc.) that can be applied as the
 * default for newly-drawn elements. Stored per profile.
 */
export declare const StylePresetSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    strokeColor: z.ZodDefault<z.ZodString>;
    backgroundColor: z.ZodDefault<z.ZodString>;
    fillStyle: z.ZodDefault<z.ZodEnum<["hachure", "cross-hatch", "solid", "zigzag"]>>;
    strokeWidth: z.ZodDefault<z.ZodNumber>;
    strokeStyle: z.ZodDefault<z.ZodEnum<["solid", "dashed", "dotted"]>>;
    roughness: z.ZodDefault<z.ZodNumber>;
    fontFamily: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    strokeColor: string;
    backgroundColor: string;
    fillStyle: "hachure" | "cross-hatch" | "solid" | "zigzag";
    strokeWidth: number;
    strokeStyle: "solid" | "dashed" | "dotted";
    roughness: number;
    fontFamily?: number | undefined;
}, {
    id: string;
    name: string;
    strokeColor?: string | undefined;
    backgroundColor?: string | undefined;
    fillStyle?: "hachure" | "cross-hatch" | "solid" | "zigzag" | undefined;
    strokeWidth?: number | undefined;
    strokeStyle?: "solid" | "dashed" | "dotted" | undefined;
    roughness?: number | undefined;
    fontFamily?: number | undefined;
}>;
export declare const StylePresetListSchema: z.ZodObject<{
    presets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        strokeColor: z.ZodDefault<z.ZodString>;
        backgroundColor: z.ZodDefault<z.ZodString>;
        fillStyle: z.ZodDefault<z.ZodEnum<["hachure", "cross-hatch", "solid", "zigzag"]>>;
        strokeWidth: z.ZodDefault<z.ZodNumber>;
        strokeStyle: z.ZodDefault<z.ZodEnum<["solid", "dashed", "dotted"]>>;
        roughness: z.ZodDefault<z.ZodNumber>;
        fontFamily: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        strokeColor: string;
        backgroundColor: string;
        fillStyle: "hachure" | "cross-hatch" | "solid" | "zigzag";
        strokeWidth: number;
        strokeStyle: "solid" | "dashed" | "dotted";
        roughness: number;
        fontFamily?: number | undefined;
    }, {
        id: string;
        name: string;
        strokeColor?: string | undefined;
        backgroundColor?: string | undefined;
        fillStyle?: "hachure" | "cross-hatch" | "solid" | "zigzag" | undefined;
        strokeWidth?: number | undefined;
        strokeStyle?: "solid" | "dashed" | "dotted" | undefined;
        roughness?: number | undefined;
        fontFamily?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    presets: {
        id: string;
        name: string;
        strokeColor: string;
        backgroundColor: string;
        fillStyle: "hachure" | "cross-hatch" | "solid" | "zigzag";
        strokeWidth: number;
        strokeStyle: "solid" | "dashed" | "dotted";
        roughness: number;
        fontFamily?: number | undefined;
    }[];
}, {
    presets: {
        id: string;
        name: string;
        strokeColor?: string | undefined;
        backgroundColor?: string | undefined;
        fillStyle?: "hachure" | "cross-hatch" | "solid" | "zigzag" | undefined;
        strokeWidth?: number | undefined;
        strokeStyle?: "solid" | "dashed" | "dotted" | undefined;
        roughness?: number | undefined;
        fontFamily?: number | undefined;
    }[];
}>;
export type StylePreset = z.infer<typeof StylePresetSchema>;
export type StylePresetList = z.infer<typeof StylePresetListSchema>;
/** Map a style preset to the Excalidraw `currentItem*` appState keys. */
export declare function presetToAppState(preset: StylePreset): Record<string, any>;
/** Extract a style preset shape from an Excalidraw appState. */
export declare function appStateToPreset(appState: Record<string, any>): Omit<StylePreset, 'id' | 'name'>;

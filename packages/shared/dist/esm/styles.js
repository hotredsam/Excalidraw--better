import { z } from 'zod';
/**
 * A reusable element style preset (stroke/fill/etc.) that can be applied as the
 * default for newly-drawn elements. Stored per profile.
 */
export const StylePresetSchema = z.object({
    id: z.string(),
    name: z.string(),
    strokeColor: z.string().default('#1e1e1e'),
    backgroundColor: z.string().default('transparent'),
    fillStyle: z.enum(['hachure', 'cross-hatch', 'solid', 'zigzag']).default('solid'),
    strokeWidth: z.number().default(1),
    strokeStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
    roughness: z.number().min(0).max(2).default(1),
    fontFamily: z.number().optional(),
});
export const StylePresetListSchema = z.object({
    presets: z.array(StylePresetSchema),
});
/** Map a style preset to the Excalidraw `currentItem*` appState keys. */
export function presetToAppState(preset) {
    const out = {
        currentItemStrokeColor: preset.strokeColor,
        currentItemBackgroundColor: preset.backgroundColor,
        currentItemFillStyle: preset.fillStyle,
        currentItemStrokeWidth: preset.strokeWidth,
        currentItemStrokeStyle: preset.strokeStyle,
        currentItemRoughness: preset.roughness,
    };
    if (preset.fontFamily !== undefined)
        out.currentItemFontFamily = preset.fontFamily;
    return out;
}
/** Extract a style preset shape from an Excalidraw appState. */
export function appStateToPreset(appState) {
    return StylePresetSchema.omit({ id: true, name: true }).parse({
        strokeColor: appState.currentItemStrokeColor,
        backgroundColor: appState.currentItemBackgroundColor,
        fillStyle: appState.currentItemFillStyle,
        strokeWidth: appState.currentItemStrokeWidth,
        strokeStyle: appState.currentItemStrokeStyle,
        roughness: appState.currentItemRoughness,
        fontFamily: appState.currentItemFontFamily,
    });
}

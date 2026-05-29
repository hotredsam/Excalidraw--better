"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylePresetListSchema = exports.StylePresetSchema = void 0;
exports.presetToAppState = presetToAppState;
exports.appStateToPreset = appStateToPreset;
const zod_1 = require("zod");
/**
 * A reusable element style preset (stroke/fill/etc.) that can be applied as the
 * default for newly-drawn elements. Stored per profile.
 */
exports.StylePresetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    strokeColor: zod_1.z.string().default('#1e1e1e'),
    backgroundColor: zod_1.z.string().default('transparent'),
    fillStyle: zod_1.z.enum(['hachure', 'cross-hatch', 'solid', 'zigzag']).default('solid'),
    strokeWidth: zod_1.z.number().default(1),
    strokeStyle: zod_1.z.enum(['solid', 'dashed', 'dotted']).default('solid'),
    roughness: zod_1.z.number().min(0).max(2).default(1),
    fontFamily: zod_1.z.number().optional(),
});
exports.StylePresetListSchema = zod_1.z.object({
    presets: zod_1.z.array(exports.StylePresetSchema),
});
/** Map a style preset to the Excalidraw `currentItem*` appState keys. */
function presetToAppState(preset) {
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
function appStateToPreset(appState) {
    return exports.StylePresetSchema.omit({ id: true, name: true }).parse({
        strokeColor: appState.currentItemStrokeColor,
        backgroundColor: appState.currentItemBackgroundColor,
        fillStyle: appState.currentItemFillStyle,
        strokeWidth: appState.currentItemStrokeWidth,
        strokeStyle: appState.currentItemStrokeStyle,
        roughness: appState.currentItemRoughness,
        fontFamily: appState.currentItemFontFamily,
    });
}

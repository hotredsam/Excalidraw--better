import { ExportPreset } from '@excalibur/shared';
/**
 * Pure planning for batch export: given a base file name and a set of presets,
 * compute the output path for each. Keeping this pure makes it easy to test and
 * lets the renderer drive the actual rendering/writing.
 */
export interface BatchExportItem {
    presetId: string;
    format: 'png' | 'svg' | 'json';
    scale: number;
    background: boolean;
    outputPath: string;
}
export declare function planBatchExport(workspacePath: string, baseName: string, presets: ExportPreset[]): BatchExportItem[];

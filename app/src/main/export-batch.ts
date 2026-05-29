import * as path from 'path';
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

export function planBatchExport(
  workspacePath: string,
  baseName: string,
  presets: ExportPreset[],
): BatchExportItem[] {
  const exportsDir = path.join(workspacePath, 'exports');
  const seen = new Set<string>();
  const items: BatchExportItem[] = [];
  for (const preset of presets) {
    const ext = preset.format === 'json' ? 'excalidraw' : preset.format;
    let name = (preset.nameTemplate || '{name}')
      .replace(/\{name\}/g, baseName)
      .replace(/\{preset\}/g, preset.id);
    // Disambiguate collisions deterministically.
    let candidate = `${name}.${ext}`;
    let n = 2;
    while (seen.has(candidate)) {
      candidate = `${name}-${n}.${ext}`;
      n++;
    }
    seen.add(candidate);
    items.push({
      presetId: preset.id,
      format: preset.format,
      scale: preset.scale,
      background: preset.background,
      outputPath: path.join(exportsDir, candidate),
    });
  }
  return items;
}

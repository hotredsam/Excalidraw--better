import * as path from 'path';
export function planBatchExport(workspacePath, baseName, presets) {
    const exportsDir = path.join(workspacePath, 'exports');
    const seen = new Set();
    const items = [];
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

import * as path from 'path';
import * as fs from 'fs-extra';
const COUNTED_EXT = new Set(['.excalidraw', '.json', '.png', '.svg']);
/**
 * Compute aggregate statistics for a workspace: file counts by type, total
 * bytes, total element count across `.excalidraw` scenes, a tag histogram, and
 * "largest"/"recently modified" leaderboards for a dashboard view.
 */
export async function computeStats(workspacePath, tags = {}) {
    const byExtension = {};
    let totalFiles = 0;
    let totalBytes = 0;
    let totalElements = 0;
    const all = [];
    async function walk(dir) {
        let items;
        try {
            items = await fs.readdir(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const item of items) {
            if (item.name.startsWith('.'))
                continue;
            const full = path.join(dir, item.name);
            if (item.isDirectory()) {
                await walk(full);
                continue;
            }
            const ext = path.extname(item.name).toLowerCase();
            if (!COUNTED_EXT.has(ext))
                continue;
            let stat;
            try {
                stat = await fs.stat(full);
            }
            catch {
                continue;
            }
            totalFiles++;
            totalBytes += stat.size;
            byExtension[ext] = (byExtension[ext] || 0) + 1;
            all.push({ name: item.name, path: full, size: stat.size, mtime: stat.mtimeMs });
            if (ext === '.excalidraw' || ext === '.json') {
                try {
                    const scene = await fs.readJson(full);
                    if (Array.isArray(scene?.elements))
                        totalElements += scene.elements.length;
                }
                catch {
                    // ignore non-scene json
                }
            }
        }
    }
    await walk(workspacePath);
    const tagHistogram = {};
    for (const list of Object.values(tags)) {
        for (const t of list)
            tagHistogram[t] = (tagHistogram[t] || 0) + 1;
    }
    const largestFiles = [...all].sort((a, b) => b.size - a.size).slice(0, 5).map(({ name, path, size }) => ({ name, path, size }));
    const recentlyModified = [...all].sort((a, b) => b.mtime - a.mtime).slice(0, 5).map(({ name, path, mtime }) => ({ name, path, mtime }));
    return { totalFiles, byExtension, totalBytes, totalElements, tagHistogram, largestFiles, recentlyModified };
}

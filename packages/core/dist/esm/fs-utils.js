import * as fs from 'fs-extra';
import * as path from 'path';
export async function writeJsonAtomic(filePath, data) {
    const tempPath = `${filePath}.tmp`;
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(tempPath, data, { spaces: 2 });
    await fs.rename(tempPath, filePath);
}

import * as fs from 'fs-extra';
import * as path from 'path';

export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(tempPath, data, { spaces: 2 });
    await fs.rename(tempPath, filePath);
  } catch (err) {
    try {
      await fs.remove(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to write JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

import * as fs from 'fs-extra';
import * as path from 'path';
import { ExcalidrawFileSchema, ExcalidrawFile } from '@excalibur/shared';

export async function readExcalidrawFile(filePath: string): Promise<ExcalidrawFile> {
  const extension = path.extname(filePath).toLowerCase();
  
  if (extension === '.excalidraw' || extension === '.json') {
    const content = await fs.readFile(filePath, 'utf-8');
    return ExcalidrawFileSchema.parse(JSON.parse(content));
  }

  if (extension === '.svg') {
    const content = await fs.readFile(filePath, 'utf-8');
    const match = content.match(/<!-- excalidraw-state: (.*?) -->/);
    if (match && match[1]) {
      try {
        return ExcalidrawFileSchema.parse(JSON.parse(match[1]));
      } catch (err) {
        throw new Error('Failed to parse embedded Excalidraw data in SVG');
      }
    }
    throw new Error('No embedded Excalidraw data found in SVG');
  }

  if (extension === '.png') {
    throw new Error('PNG embedded scene extraction not supported yet. Use .excalidraw or .svg files.');
  }

  throw new Error(`Unsupported file type: ${extension}`);
}

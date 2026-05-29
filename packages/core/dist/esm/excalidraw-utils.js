import * as fs from 'fs-extra';
import * as path from 'path';
import { ExcalidrawFileSchema } from '@excalibur/shared';
import { extractExcalidrawFromPng } from './png-excalidraw';
export async function readExcalidrawFile(filePath) {
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
            }
            catch (err) {
                throw new Error('Failed to parse embedded Excalidraw data in SVG');
            }
        }
        throw new Error('No embedded Excalidraw data found in SVG');
    }
    if (extension === '.png') {
        const buffer = await fs.readFile(filePath);
        try {
            return extractExcalidrawFromPng(buffer);
        }
        catch (err) {
            if (err.name === 'PngExtractionError') {
                throw new Error(err.message);
            }
            throw err;
        }
    }
    throw new Error(`Unsupported file type: ${extension}`);
}

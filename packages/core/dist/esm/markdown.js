import * as path from 'path';
import * as fs from 'fs-extra';
import { buildMarkdown } from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { dataUrlToBuffer, embedSceneInPng, embedSceneInSvg } from './export-utils';
export function markdownPaths(workspacePath, baseName, imageFormat) {
    const safe = sanitizeName(baseName) || 'drawing';
    const exportsDir = path.join(workspacePath, 'exports');
    return {
        imagePath: path.join(exportsDir, `${safe}.${imageFormat}`),
        markdownPath: path.join(exportsDir, `${safe}.md`),
    };
}
export async function writeMarkdownBundle(workspacePath, baseName, opts, imageData, scene, bodyText = '') {
    const { imagePath, markdownPath } = markdownPaths(workspacePath, baseName, opts.imageFormat);
    await fs.ensureDir(path.dirname(imagePath));
    if (opts.imageFormat === 'png') {
        await fs.writeFile(imagePath, embedSceneInPng(dataUrlToBuffer(imageData), scene));
    }
    else {
        await fs.writeFile(imagePath, embedSceneInSvg(imageData, scene), 'utf-8');
    }
    const md = buildMarkdown(opts, `./${path.basename(imagePath)}`, bodyText);
    await fs.writeFile(markdownPath, md, 'utf-8');
    return { imagePath, markdownPath };
}

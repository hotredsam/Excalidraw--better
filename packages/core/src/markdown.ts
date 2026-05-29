import * as path from 'path';
import * as fs from 'fs-extra';
import { MarkdownOptions, buildMarkdown } from '@excalibur/shared';
import { sanitizeName } from './path-utils';
import { dataUrlToBuffer, embedSceneInPng, embedSceneInSvg } from './export-utils';

/**
 * Markdown embed/export: writes a rendered image into `<workspace>/exports/` and
 * a sibling `.md` file that references it (relative path), optionally with
 * YAML frontmatter — handy for vault systems (Obsidian-style).
 */

export interface MarkdownBundle {
  imagePath: string;
  markdownPath: string;
}

export function markdownPaths(workspacePath: string, baseName: string, imageFormat: 'png' | 'svg'): MarkdownBundle {
  const safe = sanitizeName(baseName) || 'drawing';
  const exportsDir = path.join(workspacePath, 'exports');
  return {
    imagePath: path.join(exportsDir, `${safe}.${imageFormat}`),
    markdownPath: path.join(exportsDir, `${safe}.md`),
  };
}

export async function writeMarkdownBundle(
  workspacePath: string,
  baseName: string,
  opts: MarkdownOptions,
  imageData: string,
  scene: unknown,
  bodyText = '',
): Promise<MarkdownBundle> {
  const { imagePath, markdownPath } = markdownPaths(workspacePath, baseName, opts.imageFormat);
  await fs.ensureDir(path.dirname(imagePath));

  if (opts.imageFormat === 'png') {
    await fs.writeFile(imagePath, embedSceneInPng(dataUrlToBuffer(imageData), scene));
  } else {
    await fs.writeFile(imagePath, embedSceneInSvg(imageData, scene), 'utf-8');
  }

  const md = buildMarkdown(opts, `./${path.basename(imagePath)}`, bodyText);
  await fs.writeFile(markdownPath, md, 'utf-8');
  return { imagePath, markdownPath };
}

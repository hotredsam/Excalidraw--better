import * as path from 'path';
import * as fs from 'fs-extra';
import { BulkRenameOptions, BulkResult, applyRenameTemplate } from '@excalibur/shared';
import { isPathWithin, isDangerousPath, isWithinWorkspace } from './path-utils';

/**
 * Guardrailed bulk file operations bounded to a workspace. Each item is checked
 * for traversal/danger before acting; a per-item result is returned so partial
 * failures are visible rather than aborting the whole batch.
 */

function safe(workspacePath: string, target: string): boolean {
  return isPathWithin(workspacePath, target) && !isDangerousPath(target);
}

export async function bulkRename(
  workspacePath: string,
  files: string[],
  opts: BulkRenameOptions,
): Promise<BulkResult> {
  const details: BulkResult['details'] = [];
  let processed = 0;
  let failed = 0;
  let n = opts.startIndex ?? 1;

  for (const filePath of files) {
    try {
      if (!safe(workspacePath, filePath)) throw new Error('outside workspace');
      const ext = path.extname(filePath);
      const base = path.basename(filePath, ext);
      const newName = applyRenameTemplate(opts.template, { name: base, ext, n, padWidth: opts.padWidth });
      const dest = path.join(path.dirname(filePath), newName);
      if (!safe(workspacePath, dest)) throw new Error('destination outside workspace');
      if (await fs.pathExists(dest)) throw new Error('destination exists');
      await fs.move(filePath, dest);
      details.push({ path: filePath, result: dest });
      processed++;
    } catch (e: any) {
      details.push({ path: filePath, result: 'failed', error: e?.message || 'error' });
      failed++;
    }
    n++;
  }
  return { ok: failed === 0, processed, failed, details };
}

export async function bulkDelete(
  workspacePath: string,
  files: string[],
  deleter: (p: string) => Promise<void> = (p) => fs.remove(p),
): Promise<BulkResult> {
  const details: BulkResult['details'] = [];
  let processed = 0;
  let failed = 0;
  for (const filePath of files) {
    try {
      if (!isPathWithin(workspacePath, filePath)) throw new Error('outside workspace');
      await deleter(filePath);
      details.push({ path: filePath, result: 'deleted' });
      processed++;
    } catch (e: any) {
      details.push({ path: filePath, result: 'failed', error: e?.message || 'error' });
      failed++;
    }
  }
  return { ok: failed === 0, processed, failed, details };
}

export async function bulkMove(workspacePath: string, files: string[], destDir: string): Promise<BulkResult> {
  const details: BulkResult['details'] = [];
  let processed = 0;
  let failed = 0;
  if (!isWithinWorkspace(workspacePath, destDir) || isDangerousPath(destDir)) {
    return { ok: false, processed: 0, failed: files.length, details: files.map((p) => ({ path: p, result: 'failed', error: 'bad destination' })) };
  }
  await fs.ensureDir(destDir);
  for (const filePath of files) {
    try {
      if (!isPathWithin(workspacePath, filePath)) throw new Error('outside workspace');
      const dest = path.join(destDir, path.basename(filePath));
      if (await fs.pathExists(dest)) throw new Error('destination exists');
      await fs.move(filePath, dest);
      details.push({ path: filePath, result: dest });
      processed++;
    } catch (e: any) {
      details.push({ path: filePath, result: 'failed', error: e?.message || 'error' });
      failed++;
    }
  }
  return { ok: failed === 0, processed, failed, details };
}

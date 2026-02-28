import * as path from 'path';

/**
 * Validates if a target path is strictly within a base directory.
 * Prevents path traversal (../../) and outside-access.
 */
export function isPathWithin(baseDir: string, targetPath: string): boolean {
  const relative = path.relative(baseDir, targetPath);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Checks if a path is considered "dangerous" (e.g. System32, Program Files)
 */
export function isDangerousPath(targetPath: string): boolean {
  const dangerousPrefixes = [
    'C:\Windows',
    'C:\Program Files',
    'C:\Program Files (x86)',
    'C:\Users\All Users',
  ];
  
  const normalized = path.normalize(targetPath).toLowerCase();
  return dangerousPrefixes.some(p => normalized.startsWith(p.toLowerCase()));
}

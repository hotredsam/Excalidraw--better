import * as path from 'path';
import * as os from 'os';

/**
 * Validates if a target path is strictly within a base directory.
 * Prevents path traversal (../../) and outside-access.
 */
export function isPathWithin(baseDir: string, targetPath: string): boolean {
  const relative = path.relative(baseDir, targetPath);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Gets platform-appropriate dangerous path prefixes.
 * Protects critical system directories across Windows, macOS, and Linux.
 * Includes all dangerous prefixes regardless of current platform for comprehensive protection.
 */
function getDangerousPrefixes(): string[] {
  // Always check all dangerous prefixes regardless of the current platform
  // This ensures consistent validation when handling paths from different systems
  return [
    // Windows
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\Users\\All Users',
    'C:\\ProgramData',
    // macOS
    '/System',
    '/Library',
    '/private/var',
    '/usr',
    '/bin',
    '/sbin',
    '/etc',
    // Linux (includes overlaps with macOS)
    '/root',
    '/usr/bin',
    '/usr/sbin',
    '/boot',
    '/proc',
    '/sys',
  ];
}

/**
 * Checks if a path is considered "dangerous" (e.g. System32, Program Files).
 * Platform-aware: protects system paths on Windows, macOS, and Linux.
 */
export function isDangerousPath(targetPath: string): boolean {
  const dangerousPrefixes = getDangerousPrefixes();
  const normalized = path.normalize(targetPath).toLowerCase();

  return dangerousPrefixes.some(prefix => {
    const normalizedPrefix = path.normalize(prefix).toLowerCase();
    return normalized.startsWith(normalizedPrefix);
  });
}

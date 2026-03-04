import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { isPathWithin, isDangerousPath } from '../main/path-utils';

describe('path-utils', () => {
  describe('isPathWithin', () => {
    // Basic functionality tests
    it('should return true when target is directly within base directory', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects/file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });

    it('should return true when target is in a subdirectory of base', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects/src/main/index.ts';
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });

    it('should return false when target is outside base directory', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/documents/file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    // Path traversal attack tests
    it('should prevent simple path traversal attack with ..', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects/../secret';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    it('should prevent multiple path traversal levels', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects/../../etc/passwd';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    it('should prevent path traversal in subdirectory', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects/subdir/../../config';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    // Edge cases with same directory
    it('should return false when target equals base directory', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    it('should return false when target equals base directory with trailing slash', () => {
      const baseDir = '/home/user/projects/';
      const targetPath = '/home/user/projects';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    // Windows path tests
    it('should work with Windows paths', () => {
      const baseDir = 'C:\\Users\\user\\projects';
      const targetPath = 'C:\\Users\\user\\projects\\file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });

    it('should prevent Windows path traversal', () => {
      const baseDir = 'C:\\Users\\user\\projects';
      const targetPath = 'C:\\Users\\user\\projects\\..\\secret';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    // Absolute path detection tests
    it('should return false for absolute paths that escape the base', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/etc/passwd';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    // Similar name but different path tests
    it('should return false for paths that share a prefix but are different', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects-other/file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    it('should return false for similar directory name without traversal', () => {
      const baseDir = '/home/user/myapp';
      const targetPath = '/home/user/myapp-config/file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(false);
    });

    // Empty and special cases
    it('should handle relative paths within base directory', () => {
      const baseDir = 'projects';
      const targetPath = 'projects/src/file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });

    it('should handle deep nesting', () => {
      const baseDir = '/a/b/c';
      const targetPath = '/a/b/c/d/e/f/g/h/i/j/k.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });

    it('should normalize paths with consecutive slashes', () => {
      const baseDir = '/home/user/projects';
      const targetPath = '/home/user/projects//src//file.txt';
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });

    it('should handle case sensitivity based on OS', () => {
      const baseDir = '/home/user/Projects';
      const targetPath = '/home/user/Projects/file.txt';
      // Same case should always work
      expect(isPathWithin(baseDir, targetPath)).toBe(true);
    });
  });

  describe('isDangerousPath', () => {
    // Windows system paths
    it('should detect Windows System32 path', () => {
      expect(isDangerousPath('C:\\Windows\\System32\\cmd.exe')).toBe(true);
    });

    it('should detect Windows path case-insensitively', () => {
      expect(isDangerousPath('c:\\windows\\system32\\cmd.exe')).toBe(true);
    });

    it('should detect Program Files', () => {
      expect(isDangerousPath('C:\\Program Files\\SomeApp')).toBe(true);
    });

    it('should detect Program Files (x86)', () => {
      expect(isDangerousPath('C:\\Program Files (x86)\\SomeApp')).toBe(true);
    });

    it('should detect ProgramData', () => {
      expect(isDangerousPath('C:\\ProgramData\\config.ini')).toBe(true);
    });

    it('should detect Users\\All Users', () => {
      expect(isDangerousPath('C:\\Users\\All Users\\config')).toBe(true);
    });

    // macOS system paths
    it('should detect macOS /System path', () => {
      expect(isDangerousPath('/System/Library/Frameworks')).toBe(true);
    });

    it('should detect macOS /Library path', () => {
      expect(isDangerousPath('/Library/LaunchDaemons/com.example.plist')).toBe(true);
    });

    it('should detect macOS /private/var path', () => {
      expect(isDangerousPath('/private/var/log/system.log')).toBe(true);
    });

    // Linux system paths
    it('should detect Linux /usr path', () => {
      expect(isDangerousPath('/usr/bin/bash')).toBe(true);
    });

    it('should detect Linux /usr/sbin', () => {
      expect(isDangerousPath('/usr/sbin/iptables')).toBe(true);
    });

    it('should detect Linux /bin path', () => {
      expect(isDangerousPath('/bin/sh')).toBe(true);
    });

    it('should detect Linux /sbin path', () => {
      expect(isDangerousPath('/sbin/init')).toBe(true);
    });

    it('should detect Linux /etc path', () => {
      expect(isDangerousPath('/etc/passwd')).toBe(true);
    });

    it('should detect Linux /root path', () => {
      expect(isDangerousPath('/root/.ssh/id_rsa')).toBe(true);
    });

    it('should detect Linux /boot path', () => {
      expect(isDangerousPath('/boot/vmlinuz')).toBe(true);
    });

    it('should detect Linux /proc path', () => {
      expect(isDangerousPath('/proc/self/environ')).toBe(true);
    });

    it('should detect Linux /sys path', () => {
      expect(isDangerousPath('/sys/kernel/debug')).toBe(true);
    });

    // Safe paths
    it('should allow user home directory', () => {
      expect(isDangerousPath('/home/user/documents')).toBe(false);
    });

    it('should allow user projects directory', () => {
      expect(isDangerousPath('C:\\Users\\user\\Documents\\Project')).toBe(false);
    });

    it('should allow custom app directory', () => {
      expect(isDangerousPath('C:\\Users\\user\\AppData\\Local\\MyApp')).toBe(false);
    });

    it('should allow common safe paths', () => {
      expect(isDangerousPath('/home/user/projects/excalibur')).toBe(false);
    });

    it('should allow Windows temp directory outside system paths', () => {
      expect(isDangerousPath('C:\\Temp\\myfile.txt')).toBe(false);
    });

    // Edge cases with prefix matching
    it('should allow paths that start with similar prefixes but are safe', () => {
      expect(isDangerousPath('/usersdata/projects')).toBe(false);
    });

    it('should allow Windows paths not on system drive', () => {
      expect(isDangerousPath('D:\\Users\\projects')).toBe(false);
    });

    it('should handle lowercase Windows paths correctly', () => {
      expect(isDangerousPath('c:\\program files\\app')).toBe(true);
    });

    it('should handle mixed case paths', () => {
      expect(isDangerousPath('C:\\WINDOWS\\system32\\cmd.exe')).toBe(true);
    });

    // Dangerous executables
    it('should detect .exe files in dangerous locations', () => {
      expect(isDangerousPath('C:\\Windows\\System32\\cmd.exe')).toBe(true);
    });

    it('should detect binaries in Linux usr/bin', () => {
      expect(isDangerousPath('/usr/bin/rm')).toBe(true);
    });

    // Path normalization
    it('should handle paths with backslashes on Windows', () => {
      expect(isDangerousPath('c:\\windows\\system32\\')).toBe(true);
    });

    it('should handle forward slashes in Windows paths', () => {
      expect(isDangerousPath('c:/windows/system32')).toBe(true);
    });

    // Empty and relative paths
    it('should return false for empty string', () => {
      expect(isDangerousPath('')).toBe(false);
    });

    it('should return false for relative paths', () => {
      expect(isDangerousPath('src/main/index.ts')).toBe(false);
    });

    it('should return false for relative paths with dots', () => {
      expect(isDangerousPath('../config')).toBe(false);
    });
  });
});

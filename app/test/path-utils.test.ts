import { describe, it, expect } from 'vitest';
import { isPathWithin, isDangerousPath, isSafeName, sanitizeName } from '../src/main/path-utils';
import * as path from 'path';

describe('Path Security Utils', () => {
  describe('isPathWithin', () => {
    const baseDir = path.join('/home', 'user', 'workspace');

    it('should allow files inside workspace', () => {
      expect(isPathWithin(baseDir, path.join(baseDir, 'file.excalidraw'))).toBe(true);
      expect(isPathWithin(baseDir, path.join(baseDir, 'subfolder', 'file.excalidraw'))).toBe(true);
    });

    it('should block traversal outside workspace', () => {
      expect(isPathWithin(baseDir, path.join(baseDir, '..', 'other.txt'))).toBe(false);
      expect(isPathWithin(baseDir, path.join('/home', 'user', 'other.txt'))).toBe(false);
    });

    it('should block exactly the base directory itself (must be within a child)', () => {
      expect(isPathWithin(baseDir, baseDir)).toBe(false);
    });
  });

  describe('isDangerousPath', () => {
    it('should detect Windows system paths regardless of slash style', () => {
      // Forward slashes
      expect(isDangerousPath('C:/Windows/System32/drivers')).toBe(true);
      expect(isDangerousPath('C:/Program Files/Chrome')).toBe(true);
      // Real backslashes (this is what crashes the old, broken blocklist)
      expect(isDangerousPath('C:\\Windows\\System32')).toBe(true);
      expect(isDangerousPath('C:\\Program Files (x86)\\App')).toBe(true);
    });

    it('should detect POSIX system paths', () => {
      expect(isDangerousPath('/etc/passwd')).toBe(true);
      expect(isDangerousPath('/usr/bin/node')).toBe(true);
    });

    it('should allow normal user paths', () => {
      expect(isDangerousPath('C:\\Users\\User\\Desktop')).toBe(false);
      expect(isDangerousPath('C:/Users/User/Documents/drawing.excalidraw')).toBe(false);
      expect(isDangerousPath('/home/user/projects')).toBe(false);
      expect(isDangerousPath('D:/Projects')).toBe(false);
    });

    it('should not be fooled by similar prefixes', () => {
      expect(isDangerousPath('C:/Windows-Backup/file')).toBe(false);
    });
  });

  describe('isSafeName', () => {
    it('accepts normal names with spaces and hyphens', () => {
      expect(isSafeName('Meeting Notes.excalidraw')).toBe(true);
      expect(isSafeName('quick-export-presets')).toBe(true);
      expect(isSafeName('diagram_01.excalidraw')).toBe(true);
    });

    it('rejects traversal, separators and illegal characters', () => {
      expect(isSafeName('..')).toBe(false);
      expect(isSafeName('a/b')).toBe(false);
      expect(isSafeName('a\\b')).toBe(false);
      expect(isSafeName('bad?.txt')).toBe(false);
      expect(isSafeName('bad:name')).toBe(false);
      expect(isSafeName('')).toBe(false);
    });

    it('rejects reserved Windows device names', () => {
      expect(isSafeName('CON')).toBe(false);
      expect(isSafeName('nul.txt')).toBe(false);
    });
  });

  describe('sanitizeName', () => {
    it('strips illegal characters and falls back to untitled', () => {
      expect(sanitizeName('My:Drawing?')).toBe('MyDrawing');
      expect(sanitizeName('???')).toBe('untitled');
      expect(sanitizeName('valid name')).toBe('valid name');
    });
  });
});

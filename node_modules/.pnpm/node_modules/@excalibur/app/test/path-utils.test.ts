import { describe, it, expect } from 'vitest';
import { isPathWithin, isDangerousPath } from '../src/main/path-utils';
import * as path from 'path';

describe('Path Security Utils', () => {
  describe('isPathWithin', () => {
    const baseDir = 'C:\Users\User\Documents\Workspace';

    it('should allow files inside workspace', () => {
      expect(isPathWithin(baseDir, path.join(baseDir, 'file.excalidraw'))).toBe(true);
      expect(isPathWithin(baseDir, path.join(baseDir, 'subfolder', 'file.excalidraw'))).toBe(true);
    });

    it('should block traversal outside workspace', () => {
      expect(isPathWithin(baseDir, 'C:\Users\User\Documents\other.txt')).toBe(false);
      expect(isPathWithin(baseDir, path.join(baseDir, '..', 'other.txt'))).toBe(false);
      expect(isPathWithin(baseDir, 'C:\Windows\System32\cmd.exe')).toBe(false);
    });

    it('should block exactly the base directory itself (must be within a child)', () => {
      expect(isPathWithin(baseDir, baseDir)).toBe(false);
    });
  });

  describe('isDangerousPath', () => {
    it('should detect Windows system paths', () => {
      expect(isDangerousPath('C:\Windows\System32\drivers')).toBe(true);
      expect(isDangerousPath('c:\program files\chrome')).toBe(true);
    });

    it('should allow normal user paths', () => {
      expect(isDangerousPath('C:\Users\User\Desktop')).toBe(false);
      expect(isDangerousPath('D:\Projects')).toBe(false);
    });
  });
});

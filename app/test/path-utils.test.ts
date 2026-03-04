import { describe, it, expect } from 'vitest';
import { isPathWithin, isDangerousPath } from '../src/main/path-utils';
import * as path from 'path';

describe('Path Security Utils', () => {
  describe('isPathWithin', () => {
    const baseDir = 'C:\\Users\\User\\Documents\\Workspace';

    it('should allow files inside workspace', () => {
      expect(isPathWithin(baseDir, path.join(baseDir, 'file.excalidraw'))).toBe(true);
      expect(isPathWithin(baseDir, path.join(baseDir, 'subfolder', 'file.excalidraw'))).toBe(true);
    });

    it('should block traversal outside workspace', () => {
      expect(isPathWithin(baseDir, 'C:\\Users\\User\\Documents\\other.txt')).toBe(false);
      expect(isPathWithin(baseDir, path.join(baseDir, '..', 'other.txt'))).toBe(false);
      expect(isPathWithin(baseDir, 'C:\\Windows\\System32\\cmd.exe')).toBe(false);
    });

    it('should block exactly the base directory itself (must be within a child)', () => {
      expect(isPathWithin(baseDir, baseDir)).toBe(false);
    });
  });

  describe('isDangerousPath', () => {
    describe('Windows paths', () => {
      it('should detect Windows system paths', () => {
        expect(isDangerousPath('C:\\Windows\\System32\\drivers')).toBe(true);
        expect(isDangerousPath('c:\\program files\\chrome')).toBe(true);
        expect(isDangerousPath('C:\\Program Files (x86)\\App')).toBe(true);
        expect(isDangerousPath('C:\\ProgramData\\config')).toBe(true);
      });

      it('should allow normal user paths on Windows', () => {
        expect(isDangerousPath('C:\\Users\\User\\Desktop')).toBe(false);
        expect(isDangerousPath('D:\\Projects')).toBe(false);
      });
    });

    describe('macOS paths', () => {
      it('should detect macOS system paths', () => {
        expect(isDangerousPath('/System/Library/Frameworks')).toBe(true);
        expect(isDangerousPath('/Library/Preferences')).toBe(true);
        expect(isDangerousPath('/private/var/log')).toBe(true);
        expect(isDangerousPath('/usr/bin/python')).toBe(true);
        expect(isDangerousPath('/bin/bash')).toBe(true);
        expect(isDangerousPath('/sbin/ifconfig')).toBe(true);
        expect(isDangerousPath('/etc/hosts')).toBe(true);
      });

      it('should allow normal user paths on macOS', () => {
        expect(isDangerousPath('/Users/user/Desktop')).toBe(false);
        expect(isDangerousPath('/Users/user/Documents')).toBe(false);
      });
    });

    describe('Linux paths', () => {
      it('should detect Linux system paths', () => {
        expect(isDangerousPath('/etc/passwd')).toBe(true);
        expect(isDangerousPath('/etc/shadow')).toBe(true);
        expect(isDangerousPath('/root/.ssh')).toBe(true);
        expect(isDangerousPath('/bin/bash')).toBe(true);
        expect(isDangerousPath('/sbin/init')).toBe(true);
        expect(isDangerousPath('/usr/bin/sudo')).toBe(true);
        expect(isDangerousPath('/usr/sbin/sshd')).toBe(true);
        expect(isDangerousPath('/boot/vmlinuz')).toBe(true);
        expect(isDangerousPath('/proc/meminfo')).toBe(true);
        expect(isDangerousPath('/sys/kernel')).toBe(true);
      });

      it('should allow normal user paths on Linux', () => {
        expect(isDangerousPath('/home/user/Desktop')).toBe(false);
        expect(isDangerousPath('/opt/myapp')).toBe(false);
      });
    });
  });
});

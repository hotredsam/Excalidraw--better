import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { writeJsonAtomic } from '../main/fs-utils';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: vi.fn(),
  ensureDir: vi.fn(),
  writeJson: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn(),
}));

describe('fs-utils', () => {
  describe('writeJsonAtomic', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should write JSON file successfully', async () => {
      const testFile = '/test/path/file.json';
      const testData = { key: 'value', nested: { prop: 123 } };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(testFile));
      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, testData, { spaces: 2 });
      expect(fs.rename).toHaveBeenCalledWith(`${testFile}.tmp`, testFile);
    });

    it('should ensure parent directory exists before writing', async () => {
      const testFile = '/test/deep/nested/path/file.json';
      const testData = { test: true };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.ensureDir).toHaveBeenCalledWith('/test/deep/nested/path');
    });

    it('should use atomic rename operation', async () => {
      const testFile = '/test/file.json';
      const testData = { data: 'test' };
      const tempPath = `${testFile}.tmp`;

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.rename).toHaveBeenCalledWith(tempPath, testFile);
    });

    it('should format JSON with 2-space indentation', async () => {
      const testFile = '/test/file.json';
      const testData = { key: 'value' };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      const writeJsonCall = (fs.writeJson as any).mock.calls[0];
      expect(writeJsonCall[2]).toEqual({ spaces: 2 });
    });

    it('should handle write failures and throw descriptive error', async () => {
      const testFile = '/test/file.json';
      const testData = { key: 'value' };
      const writeError = new Error('Write failed');

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockRejectedValue(writeError);
      (fs.remove as any).mockResolvedValue(undefined);

      await expect(writeJsonAtomic(testFile, testData)).rejects.toThrow(
        'Failed to write JSON file: Write failed'
      );
    });

    it('should clean up temp file on write failure', async () => {
      const testFile = '/test/file.json';
      const testData = { key: 'value' };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockRejectedValue(new Error('Write failed'));
      (fs.remove as any).mockResolvedValue(undefined);

      try {
        await writeJsonAtomic(testFile, testData);
      } catch {
        // Expected to throw
      }

      expect(fs.remove).toHaveBeenCalledWith(`${testFile}.tmp`);
    });

    it('should handle cleanup errors silently', async () => {
      const testFile = '/test/file.json';
      const testData = { key: 'value' };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockRejectedValue(new Error('Write failed'));
      (fs.remove as any).mockRejectedValue(new Error('Cleanup failed'));

      // Should not throw from cleanup error
      await expect(writeJsonAtomic(testFile, testData)).rejects.toThrow(
        'Failed to write JSON file: Write failed'
      );
    });

    it('should handle rename failures and throw error', async () => {
      const testFile = '/test/file.json';
      const testData = { key: 'value' };
      const renameError = new Error('Rename failed');

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockRejectedValue(renameError);
      (fs.remove as any).mockResolvedValue(undefined);

      await expect(writeJsonAtomic(testFile, testData)).rejects.toThrow(
        'Failed to write JSON file: Rename failed'
      );
    });

    it('should handle nested object data', async () => {
      const testFile = '/test/file.json';
      const testData = {
        user: {
          name: 'John',
          email: 'john@example.com',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        items: [1, 2, 3],
      };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, testData, { spaces: 2 });
    });

    it('should handle array data', async () => {
      const testFile = '/test/array.json';
      const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, testData, { spaces: 2 });
    });

    it('should handle null data', async () => {
      const testFile = '/test/null.json';
      const testData = null;

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, null, { spaces: 2 });
    });

    it('should handle empty object data', async () => {
      const testFile = '/test/empty.json';
      const testData = {};

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, {}, { spaces: 2 });
    });

    it('should handle string data', async () => {
      const testFile = '/test/string.json';
      const testData = 'simple string';

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, 'simple string', { spaces: 2 });
    });

    it('should handle numeric data', async () => {
      const testFile = '/test/number.json';
      const testData = 42;

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      expect(fs.writeJson).toHaveBeenCalledWith(`${testFile}.tmp`, 42, { spaces: 2 });
    });

    it('should handle unknown error messages gracefully', async () => {
      const testFile = '/test/file.json';
      const testData = { key: 'value' };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockRejectedValue('Some non-Error object');
      (fs.remove as any).mockResolvedValue(undefined);

      await expect(writeJsonAtomic(testFile, testData)).rejects.toThrow(
        'Failed to write JSON file: Unknown error'
      );
    });

    it('should use correct temp file extension', async () => {
      const testFile = '/test/config.json';
      const testData = { setting: 'value' };

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.writeJson as any).mockResolvedValue(undefined);
      (fs.rename as any).mockResolvedValue(undefined);

      await writeJsonAtomic(testFile, testData);

      const tempPath = (fs.writeJson as any).mock.calls[0][0];
      expect(tempPath).toBe('/test/config.json.tmp');
    });
  });
});

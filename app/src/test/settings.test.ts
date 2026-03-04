import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { SettingsStore } from '../main/settings';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  readJson: vi.fn(),
  writeJson: vi.fn(),
  ensureDir: vi.fn(),
  remove: vi.fn(),
  rename: vi.fn(),
}));

// Mock writeJsonAtomic
vi.mock('../main/fs-utils', () => ({
  writeJsonAtomic: vi.fn(async () => {}),
}));

describe('SettingsStore', () => {
  let settingsStore: SettingsStore;
  const testProfileDir = '/test/profile';

  beforeEach(() => {
    vi.clearAllMocks();
    settingsStore = new SettingsStore(testProfileDir);
  });

  describe('constructor', () => {
    it('should initialize with correct settings file path', () => {
      const store = new SettingsStore('/custom/profile');
      expect((store as any).settingsFile).toBe(
        path.join('/custom/profile', 'settings', 'settings.json')
      );
    });

    it('should initialize with empty settings object', () => {
      const store = new SettingsStore(testProfileDir);
      const settings = (store as any).settings;
      expect(settings).toBeDefined();
      expect(typeof settings).toBe('object');
    });

    it('should handle profile directories with spaces', () => {
      const dirWithSpaces = '/path/with spaces/profile';
      const store = new SettingsStore(dirWithSpaces);
      expect((store as any).settingsFile).toContain('with spaces');
      expect((store as any).settingsFile).toContain('settings');
    });
  });

  describe('init', () => {
    it('should load settings from existing file', async () => {
      const mockSettings = {
        autosave: false,
        autosaveIntervalSeconds: 30,
        defaultExportFormat: 'svg' as const,
        confirmOnDelete: false,
        showGrid: true,
      };

      (fs.pathExists as any).mockResolvedValue(true);
      (fs.readJson as any).mockResolvedValue(mockSettings);

      await settingsStore.init();

      expect(fs.pathExists).toHaveBeenCalledWith(
        path.join(testProfileDir, 'settings', 'settings.json')
      );
      expect(fs.readJson).toHaveBeenCalledWith(
        path.join(testProfileDir, 'settings', 'settings.json')
      );
    });

    it('should create default settings if file does not exist', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();

      expect(fs.pathExists).toHaveBeenCalled();
    });

    it('should parse and validate settings schema on init', async () => {
      const mockSettings = {
        autosave: true,
        autosaveIntervalSeconds: 20,
        defaultExportFormat: 'png' as const,
      };

      (fs.pathExists as any).mockResolvedValue(true);
      (fs.readJson as any).mockResolvedValue(mockSettings);

      await settingsStore.init();

      const settings = settingsStore.get();
      expect(settings.autosave).toBe(true);
    });

    it('should use default values for missing properties', async () => {
      const minimalSettings = {};

      (fs.pathExists as any).mockResolvedValue(true);
      (fs.readJson as any).mockResolvedValue(minimalSettings);

      await settingsStore.init();

      const settings = settingsStore.get();
      expect(settings).toBeDefined();
    });
  });

  describe('get', () => {
    it('should return current settings object', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const settings = settingsStore.get();

      expect(settings).toBeDefined();
      expect(typeof settings).toBe('object');
    });

    it('should return the same object reference between calls', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const settings1 = settingsStore.get();
      const settings2 = settingsStore.get();

      expect(settings1).toBe(settings2);
    });

    it('should return object with all expected properties', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const settings = settingsStore.get();

      expect(settings).toHaveProperty('autosave');
      expect(settings).toHaveProperty('autosaveIntervalSeconds');
      expect(settings).toHaveProperty('defaultExportFormat');
      expect(settings).toHaveProperty('confirmOnDelete');
      expect(settings).toHaveProperty('showGrid');
    });
  });

  describe('update', () => {
    it('should update single setting property', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const updated = await settingsStore.update({ autosave: false });

      expect(updated.autosave).toBe(false);
    });

    it('should update multiple properties at once', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const updated = await settingsStore.update({
        autosave: false,
        autosaveIntervalSeconds: 60,
        showGrid: true,
      });

      expect(updated.autosave).toBe(false);
      expect(updated.autosaveIntervalSeconds).toBe(60);
      expect(updated.showGrid).toBe(true);
    });

    it('should persist updated settings to file', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      await settingsStore.update({ autosave: false });

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should preserve unchanged properties during update', async () => {
      const mockSettings = {
        autosave: true,
        autosaveIntervalSeconds: 15,
        defaultExportFormat: 'png' as const,
        confirmOnDelete: true,
        showGrid: false,
      };

      (fs.pathExists as any).mockResolvedValue(true);
      (fs.readJson as any).mockResolvedValue(mockSettings);

      await settingsStore.init();
      const updated = await settingsStore.update({ showGrid: true });

      expect(updated.autosave).toBe(true);
      expect(updated.autosaveIntervalSeconds).toBe(15);
      expect(updated.showGrid).toBe(true);
    });

    it('should validate updated settings against schema', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const updated = await settingsStore.update({
        defaultExportFormat: 'svg' as const,
      });

      expect(updated.defaultExportFormat).toBe('svg');
    });

    it('should return updated settings object', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const updated = await settingsStore.update({ autosave: false });

      expect(updated).toBeDefined();
      expect(updated.autosave).toBe(false);
    });

    it('should update internal state', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      await settingsStore.update({ autosave: false });

      const current = settingsStore.get();
      expect(current.autosave).toBe(false);
    });

    it('should handle empty partial update object', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      const beforeUpdate = settingsStore.get();
      const updated = await settingsStore.update({});

      expect(updated).toEqual(beforeUpdate);
    });

    it('should call save after update', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();
      await settingsStore.update({ autosave: false });

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should handle boolean property updates', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();

      const updated1 = await settingsStore.update({ confirmOnDelete: true });
      expect(updated1.confirmOnDelete).toBe(true);

      const updated2 = await settingsStore.update({ confirmOnDelete: false });
      expect(updated2.confirmOnDelete).toBe(false);
    });

    it('should handle numeric property updates', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();

      const updated = await settingsStore.update({ autosaveIntervalSeconds: 45 });
      expect(updated.autosaveIntervalSeconds).toBe(45);
    });

    it('should handle enum property updates', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      await settingsStore.init();

      const updated1 = await settingsStore.update({ defaultExportFormat: 'png' });
      expect(updated1.defaultExportFormat).toBe('png');

      const updated2 = await settingsStore.update({ defaultExportFormat: 'svg' });
      expect(updated2.defaultExportFormat).toBe('svg');
    });
  });

  describe('error handling', () => {
    it('should handle read errors during init', async () => {
      (fs.pathExists as any).mockResolvedValue(true);
      (fs.readJson as any).mockRejectedValue(new Error('Read failed'));

      await expect(settingsStore.init()).rejects.toThrow();
    });

    it('should handle write errors during save', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      const { writeJsonAtomic } = await import('../main/fs-utils');
      (writeJsonAtomic as any).mockRejectedValue(new Error('Write failed'));

      await expect(settingsStore.init()).rejects.toThrow();
    });
  });
});

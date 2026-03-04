import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { randomUUID } from 'crypto';
import { ProfileStore } from '../main/profile';

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((pathName: string) => {
      if (pathName === 'userData') return '/test/appdata';
      return '/test/default';
    }),
  },
}));

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: vi.fn(),
  ensureDir: vi.fn(),
  pathExists: vi.fn(),
  readJson: vi.fn(),
  remove: vi.fn(),
  writeJson: vi.fn(),
  rename: vi.fn(),
}));

// Mock writeJsonAtomic
vi.mock('../main/fs-utils', () => ({
  writeJsonAtomic: vi.fn(),
}));

// Mock randomUUID
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

describe('ProfileStore', () => {
  let profileStore: ProfileStore;

  beforeEach(() => {
    vi.clearAllMocks();
    profileStore = new ProfileStore();
  });

  describe('constructor', () => {
    it('should initialize with userData path from electron', () => {
      const store = new ProfileStore();
      expect((store as any).baseDir).toContain('profiles');
    });

    it('should set correct profiles file path', () => {
      const store = new ProfileStore();
      expect((store as any).profilesFile).toContain('profiles.json');
    });

    it('should set correct active file path', () => {
      const store = new ProfileStore();
      expect((store as any).activeFile).toContain('active.json');
    });

    it('should initialize empty profiles array', () => {
      const store = new ProfileStore();
      expect((store as any).profiles).toEqual([]);
    });

    it('should initialize null active profile ID', () => {
      const store = new ProfileStore();
      expect((store as any).activeProfileId).toBeNull();
    });
  });

  describe('init', () => {
    it('should ensure profiles directory exists', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();

      expect(fs.ensureDir).toHaveBeenCalled();
    });

    it('should load profiles from file if exists', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Default',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();

      expect(fs.readJson).toHaveBeenCalled();
    });

    it('should load active profile ID from file if exists', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Default',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockProfiles)
        .mockResolvedValueOnce({ activeId: 'profile-1' });

      await profileStore.init();

      expect(fs.readJson).toHaveBeenCalledTimes(2);
    });

    it('should create default profile if no profiles exist', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should set first profile as active if none specified', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return all profiles', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      const profiles = await profileStore.list();

      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should return empty array if no profiles', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const profiles = await profileStore.list();

      expect(Array.isArray(profiles)).toBe(true);
    });
  });

  describe('getActive', () => {
    it('should return active profile', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Default',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockProfiles)
        .mockResolvedValueOnce({ activeId: 'profile-1' });

      await profileStore.init();
      const active = await profileStore.getActive();

      expect(active).not.toBeNull();
      expect(active?.id).toBe('profile-1');
    });

    it('should return null if no active profile', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      // The init should set a default profile, but let's test the method
      (profileStore as any).activeProfileId = 'nonexistent';
      (profileStore as any).profiles = [];

      const active = await profileStore.getActive();
      expect(active).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new profile with generated ID', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const profile = await profileStore.create('New Profile');

      expect(profile.id).toBeDefined();
      expect(profile.name).toBe('New Profile');
    });

    it('should set created and updated timestamps', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const beforeCreate = Date.now();
      const profile = await profileStore.create('Test Profile');
      const afterCreate = Date.now();

      expect(profile.createdAt).toBeGreaterThanOrEqual(beforeCreate);
      expect(profile.createdAt).toBeLessThanOrEqual(afterCreate);
      expect(profile.updatedAt).toBe(profile.createdAt);
    });

    it('should initialize profile folders', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const initialCalls = (fs.ensureDir as any).mock?.calls?.length ?? 0;
      await profileStore.create('New Profile');
      const finalCalls = (fs.ensureDir as any).mock?.calls?.length ?? 0;

      // Verify that ensureDir was called for profile folders
      expect(finalCalls).toBeGreaterThan(initialCalls);
    });

    it('should persist profile to file', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      await profileStore.create('Test Profile');

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should add profile to internal list', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const initialCount = ((await profileStore.list()) || []).length;
      await profileStore.create('Another Profile');
      const finalCount = ((await profileStore.list()) || []).length;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('rename', () => {
    it('should rename existing profile', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Old Name',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      const renamed = await profileStore.rename('profile-1', 'New Name');

      expect(renamed.name).toBe('New Name');
    });

    it('should update updatedAt timestamp on rename', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Old Name',
          createdAt: Date.now() - 10000,
          updatedAt: Date.now() - 10000,
          lastOpenedAt: Date.now() - 10000,
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      const renamed = await profileStore.rename('profile-1', 'New Name');

      expect(renamed.updatedAt).toBeGreaterThan(mockProfiles[0].updatedAt);
    });

    it('should throw error if profile not found', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();

      await expect(profileStore.rename('nonexistent', 'New Name')).rejects.toThrow();
    });

    it('should persist rename to file', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Old Name',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      const { writeJsonAtomic } = await import('../main/fs-utils');
      const callCountBefore = (writeJsonAtomic as any).mock?.calls?.length ?? 0;
      await profileStore.rename('profile-1', 'New Name');
      const callCountAfter = (writeJsonAtomic as any).mock?.calls?.length ?? 0;

      expect(callCountAfter).toBeGreaterThan(callCountBefore);
    });
  });

  describe('delete', () => {
    it('should delete profile by ID', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);
      (fs.remove as any).mockResolvedValue(undefined);

      await profileStore.init();
      const initialCount = (await profileStore.list()).length;
      await profileStore.delete('profile-1');
      const finalCount = (await profileStore.list()).length;

      expect(finalCount).toBeLessThan(initialCount);
    });

    it('should prevent deletion of only profile', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();

      await expect(profileStore.delete('profile-1')).rejects.toThrow(
        'Cannot delete the only profile'
      );
    });

    it('should switch to another profile if deleting active profile', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockProfiles)
        .mockResolvedValueOnce({ activeId: 'profile-1' });
      (fs.remove as any).mockResolvedValue(undefined);

      await profileStore.init();
      await profileStore.delete('profile-1');

      const active = await profileStore.getActive();
      expect(active?.id).not.toBe('profile-1');
    });

    it('should remove profile directory', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);
      (fs.remove as any).mockResolvedValue(undefined);

      await profileStore.init();
      await profileStore.delete('profile-1');

      expect(fs.remove).toHaveBeenCalled();
    });
  });

  describe('setActive', () => {
    it('should set active profile by ID', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      await profileStore.setActive('profile-2');

      const active = await profileStore.getActive();
      expect(active?.id).toBe('profile-2');
    });

    it('should update lastOpenedAt when setting active', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now() - 10000,
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      const beforeSetActive = Date.now();
      await profileStore.setActive('profile-1');
      const afterSetActive = Date.now();

      const profile = await profileStore.getActive();
      expect(profile?.lastOpenedAt).toBeGreaterThanOrEqual(beforeSetActive);
      expect(profile?.lastOpenedAt).toBeLessThanOrEqual(afterSetActive);
    });

    it('should throw error if profile not found', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();

      await expect(profileStore.setActive('nonexistent')).rejects.toThrow();
    });

    it('should persist active profile ID', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockProfiles);

      await profileStore.init();
      const { writeJsonAtomic } = await import('../main/fs-utils');
      const callCountBefore = (writeJsonAtomic as any).mock?.calls?.length ?? 0;
      await profileStore.setActive('profile-2');
      const callCountAfter = (writeJsonAtomic as any).mock?.calls?.length ?? 0;

      expect(callCountAfter).toBeGreaterThan(callCountBefore);
    });
  });

  describe('getProfileDir', () => {
    it('should return correct profile directory path', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const profileDir = profileStore.getProfileDir('profile-123');

      expect(profileDir).toContain('profile-123');
      expect(profileDir).toContain('profiles');
    });

    it('should work with different profile IDs', async () => {
      (fs.ensureDir as any).mockResolvedValue(undefined);
      (fs.pathExists as any).mockResolvedValue(false);

      await profileStore.init();
      const dir1 = profileStore.getProfileDir('id-1');
      const dir2 = profileStore.getProfileDir('id-2');

      expect(dir1).not.toBe(dir2);
      expect(dir1).toContain('id-1');
      expect(dir2).toContain('id-2');
    });
  });
});

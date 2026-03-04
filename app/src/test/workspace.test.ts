import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { randomUUID } from 'crypto';
import { WorkspaceStore } from '../main/workspace';

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

// Mock randomUUID
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'workspace-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

describe('WorkspaceStore', () => {
  let workspaceStore: WorkspaceStore;
  const testProfileDir = '/test/profile';

  beforeEach(() => {
    vi.clearAllMocks();
    workspaceStore = new WorkspaceStore(testProfileDir);
  });

  describe('constructor', () => {
    it('should initialize with correct workspace file path', () => {
      const store = new WorkspaceStore('/custom/profile');
      expect((store as any).workspaceFile).toBe(
        path.join('/custom/profile', 'settings', 'workspaces.json')
      );
    });

    it('should initialize with correct active file path', () => {
      const store = new WorkspaceStore('/custom/profile');
      expect((store as any).activeFile).toBe(
        path.join('/custom/profile', 'settings', 'active_workspace.json')
      );
    });

    it('should initialize empty workspaces array', () => {
      const store = new WorkspaceStore(testProfileDir);
      expect((store as any).workspaces).toEqual([]);
    });

    it('should initialize null active workspace ID', () => {
      const store = new WorkspaceStore(testProfileDir);
      expect((store as any).activeWorkspaceId).toBeNull();
    });
  });

  describe('init', () => {
    it('should load workspaces from file if exists', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();

      expect(fs.readJson).toHaveBeenCalled();
    });

    it('should load active workspace ID from file if exists', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockWorkspaces)
        .mockResolvedValueOnce({ activeId: 'workspace-1' });

      await workspaceStore.init();

      expect(fs.readJson).toHaveBeenCalledTimes(2);
    });

    it('should handle missing workspace file', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();

      const workspaces = await workspaceStore.list();
      expect(Array.isArray(workspaces)).toBe(true);
    });
  });

  describe('list', () => {
    it('should return all workspaces', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
        {
          id: 'workspace-2',
          name: 'Project B',
          path: '/home/user/projects/b',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      const workspaces = await workspaceStore.list();

      expect(Array.isArray(workspaces)).toBe(true);
      expect(workspaces.length).toBeGreaterThan(0);
    });

    it('should return empty array if no workspaces', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      const workspaces = await workspaceStore.list();

      expect(Array.isArray(workspaces)).toBe(true);
      expect(workspaces.length).toBe(0);
    });
  });

  describe('getActive', () => {
    it('should return active workspace', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockWorkspaces)
        .mockResolvedValueOnce({ activeId: 'workspace-1' });

      await workspaceStore.init();
      const active = await workspaceStore.getActive();

      expect(active).not.toBeNull();
      expect(active?.id).toBe('workspace-1');
    });

    it('should return null if no active workspace', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      const active = await workspaceStore.getActive();

      expect(active).toBeNull();
    });

    it('should return null if active ID does not exist', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockWorkspaces)
        .mockResolvedValueOnce({ activeId: 'nonexistent' });

      await workspaceStore.init();
      const active = await workspaceStore.getActive();

      expect(active).toBeNull();
    });
  });

  describe('add', () => {
    it('should add new workspace with generated ID', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      const workspace = await workspaceStore.add('New Workspace', '/path/to/workspace');

      expect(workspace.id).toBeDefined();
      expect(workspace.name).toBe('New Workspace');
      expect(workspace.path).toBe('/path/to/workspace');
    });

    it('should set lastOpenedAt timestamp on add', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      const beforeAdd = Date.now();
      const workspace = await workspaceStore.add('New Workspace', '/path/to/workspace');
      const afterAdd = Date.now();

      expect(workspace.lastOpenedAt).toBeGreaterThanOrEqual(beforeAdd);
      expect(workspace.lastOpenedAt).toBeLessThanOrEqual(afterAdd);
    });

    it('should update lastOpenedAt when re-adding existing workspace', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now() - 10000,
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      const workspace = await workspaceStore.add('Project A', '/home/user/projects/a');

      expect(workspace.lastOpenedAt).toBeGreaterThan(mockWorkspaces[0].lastOpenedAt);
    });

    it('should persist workspace to file', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      await workspaceStore.add('New Workspace', '/path/to/workspace');

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should add workspace to internal list', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      const initialCount = (await workspaceStore.list()).length;
      await workspaceStore.add('New Workspace', '/path/to/workspace');
      const finalCount = (await workspaceStore.list()).length;

      expect(finalCount).toBeGreaterThan(initialCount);
    });

    it('should not create duplicate workspace path entries', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now() - 10000,
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      const workspace1 = await workspaceStore.list();
      const initialCount = workspace1.length;

      await workspaceStore.add('Project A Updated', '/home/user/projects/a');
      const workspace2 = await workspaceStore.list();
      const finalCount = workspace2.length;

      expect(finalCount).toBe(initialCount);
    });
  });

  describe('remove', () => {
    it('should remove workspace by ID', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
        {
          id: 'workspace-2',
          name: 'Project B',
          path: '/home/user/projects/b',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      const initialCount = (await workspaceStore.list()).length;
      await workspaceStore.remove('workspace-1');
      const finalCount = (await workspaceStore.list()).length;

      expect(finalCount).toBeLessThan(initialCount);
    });

    it('should clear active workspace if removing active', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockWorkspaces)
        .mockResolvedValueOnce({ activeId: 'workspace-1' });

      await workspaceStore.init();
      await workspaceStore.remove('workspace-1');

      const active = await workspaceStore.getActive();
      expect(active).toBeNull();
    });

    it('should persist removal to file', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
        {
          id: 'workspace-2',
          name: 'Project B',
          path: '/home/user/projects/b',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      await workspaceStore.remove('workspace-1');

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should handle removal of non-existent workspace gracefully', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();

      // Should not throw
      await workspaceStore.remove('nonexistent');

      const workspaces = await workspaceStore.list();
      expect(workspaces.length).toBe(0);
    });
  });

  describe('setActive', () => {
    it('should set active workspace by ID', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
        {
          id: 'workspace-2',
          name: 'Project B',
          path: '/home/user/projects/b',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      await workspaceStore.setActive('workspace-2');

      const active = await workspaceStore.getActive();
      expect(active?.id).toBe('workspace-2');
    });

    it('should set active to null when given null', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      (fs.readJson as any)
        .mockResolvedValueOnce(mockWorkspaces)
        .mockResolvedValueOnce({ activeId: 'workspace-1' });

      await workspaceStore.init();
      await workspaceStore.setActive(null);

      const active = await workspaceStore.getActive();
      expect(active).toBeNull();
    });

    it('should update lastOpenedAt when setting active', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now() - 10000,
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      const beforeSetActive = Date.now();
      await workspaceStore.setActive('workspace-1');
      const afterSetActive = Date.now();

      const workspace = await workspaceStore.getActive();
      expect(workspace?.lastOpenedAt).toBeGreaterThanOrEqual(beforeSetActive);
      expect(workspace?.lastOpenedAt).toBeLessThanOrEqual(afterSetActive);
    });

    it('should throw error if workspace ID does not exist', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();

      await expect(workspaceStore.setActive('nonexistent')).rejects.toThrow();
    });

    it('should persist active workspace ID to file', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now(),
        },
        {
          id: 'workspace-2',
          name: 'Project B',
          path: '/home/user/projects/b',
          lastOpenedAt: Date.now(),
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      await workspaceStore.setActive('workspace-2');

      const { writeJsonAtomic } = await import('../main/fs-utils');
      expect(writeJsonAtomic).toHaveBeenCalled();
    });

    it('should not update lastOpenedAt when setting to null', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Project A',
          path: '/home/user/projects/a',
          lastOpenedAt: Date.now() - 10000,
        },
      ];

      (fs.pathExists as any)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (fs.readJson as any).mockResolvedValue(mockWorkspaces);

      await workspaceStore.init();
      await workspaceStore.setActive(null);

      const workspaces = await workspaceStore.list();
      expect(workspaces[0].lastOpenedAt).toBe(mockWorkspaces[0].lastOpenedAt);
    });
  });

  describe('state immutability', () => {
    it('should not mutate internal state directly', async () => {
      (fs.pathExists as any)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      await workspaceStore.init();
      const workspace1 = await workspaceStore.add('Workspace 1', '/path/1');
      const workspace2 = await workspaceStore.add('Workspace 2', '/path/2');

      expect(workspace1.name).toBe('Workspace 1');
      expect(workspace2.name).toBe('Workspace 2');
    });
  });
});

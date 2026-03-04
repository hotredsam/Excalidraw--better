import { describe, it, expect } from 'vitest';
import { WorkspaceListSchema } from '../src/index';

describe('WorkspaceListSchema', () => {
  it('accepts empty workspaces list', () => {
    const list = WorkspaceListSchema.parse({
      workspaces: [],
    });
    expect(list.workspaces).toHaveLength(0);
  });

  it('accepts single workspace', () => {
    const list = WorkspaceListSchema.parse({
      workspaces: [
        {
          id: 'ws1',
          name: 'Workspace One',
          path: '/home/user/workspace1',
          lastOpenedAt: 1000,
        },
      ],
    });
    expect(list.workspaces).toHaveLength(1);
    expect(list.workspaces[0].id).toBe('ws1');
  });

  it('accepts multiple workspaces', () => {
    const list = WorkspaceListSchema.parse({
      workspaces: [
        {
          id: 'ws1',
          name: 'Project Alpha',
          path: '/home/user/projects/alpha',
          lastOpenedAt: 1000,
        },
        {
          id: 'ws2',
          name: 'Project Beta',
          path: '/home/user/projects/beta',
          lastOpenedAt: 2000,
        },
        {
          id: 'ws3',
          name: 'Project Gamma',
          path: '/home/user/projects/gamma',
          lastOpenedAt: 3000,
        },
      ],
    });
    expect(list.workspaces).toHaveLength(3);
    expect(list.workspaces[1].name).toBe('Project Beta');
    expect(list.workspaces[2].path).toBe('/home/user/projects/gamma');
  });

  it('rejects missing workspaces field', () => {
    expect(() => WorkspaceListSchema.parse({})).toThrow();
  });

  it('rejects invalid workspace in list', () => {
    expect(() => WorkspaceListSchema.parse({
      workspaces: [
        {
          id: 'ws1',
          name: 'Workspace One',
          path: '/home/user/workspace1',
          // missing lastOpenedAt
        },
      ],
    })).toThrow();
  });

  it('rejects non-array workspaces field', () => {
    expect(() => WorkspaceListSchema.parse({
      workspaces: 'not an array',
    })).toThrow();
  });

  it('parses list with various workspace paths', () => {
    const list = WorkspaceListSchema.parse({
      workspaces: [
        {
          id: 'ws-unix',
          name: 'Unix Workspace',
          path: '/var/user/workspace',
          lastOpenedAt: 1000,
        },
        {
          id: 'ws-win',
          name: 'Windows Workspace',
          path: 'C:\\Users\\user\\workspace',
          lastOpenedAt: 2000,
        },
      ],
    });
    expect(list.workspaces).toHaveLength(2);
    expect(list.workspaces[0].path).toBe('/var/user/workspace');
    expect(list.workspaces[1].path).toBe('C:\\Users\\user\\workspace');
  });
});

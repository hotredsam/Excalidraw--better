import { describe, it, expect } from 'vitest';
import { ProfileListSchema } from '../src/index';

describe('ProfileListSchema', () => {
  it('accepts empty profiles list', () => {
    const list = ProfileListSchema.parse({
      profiles: [],
    });
    expect(list.profiles).toHaveLength(0);
  });

  it('accepts single profile', () => {
    const list = ProfileListSchema.parse({
      profiles: [
        {
          id: 'user1',
          name: 'User One',
          createdAt: 1000,
          updatedAt: 2000,
          lastOpenedAt: 3000,
        },
      ],
    });
    expect(list.profiles).toHaveLength(1);
    expect(list.profiles[0].id).toBe('user1');
  });

  it('accepts multiple profiles', () => {
    const list = ProfileListSchema.parse({
      profiles: [
        {
          id: 'user1',
          name: 'User One',
          createdAt: 1000,
          updatedAt: 2000,
          lastOpenedAt: 3000,
        },
        {
          id: 'user2',
          name: 'User Two',
          createdAt: 1500,
          updatedAt: 2500,
          lastOpenedAt: 3500,
        },
        {
          id: 'user3',
          name: 'User Three',
          createdAt: 2000,
          updatedAt: 3000,
          lastOpenedAt: 4000,
        },
      ],
    });
    expect(list.profiles).toHaveLength(3);
    expect(list.profiles[1].name).toBe('User Two');
    expect(list.profiles[2].id).toBe('user3');
  });

  it('rejects missing profiles field', () => {
    expect(() => ProfileListSchema.parse({})).toThrow();
  });

  it('rejects invalid profile in list', () => {
    expect(() => ProfileListSchema.parse({
      profiles: [
        {
          id: 'user1',
          name: 'User One',
          createdAt: 1000,
          updatedAt: 2000,
          // missing lastOpenedAt
        },
      ],
    })).toThrow();
  });

  it('rejects non-array profiles field', () => {
    expect(() => ProfileListSchema.parse({
      profiles: 'not an array',
    })).toThrow();
  });

  it('rejects profiles as object instead of array', () => {
    expect(() => ProfileListSchema.parse({
      profiles: {
        user1: { id: 'user1', name: 'User One', createdAt: 0, updatedAt: 0, lastOpenedAt: 0 },
      },
    })).toThrow();
  });

  it('parses list with mixed profile data', () => {
    const list = ProfileListSchema.parse({
      profiles: [
        {
          id: 'abc',
          name: 'Alice',
          createdAt: 100,
          updatedAt: 200,
          lastOpenedAt: 300,
        },
        {
          id: 'def',
          name: 'Bob',
          createdAt: 400,
          updatedAt: 500,
          lastOpenedAt: 600,
        },
      ],
    });
    expect(list.profiles[0].name).toBe('Alice');
    expect(list.profiles[1].name).toBe('Bob');
  });
});

import { describe, it, expect } from 'vitest';
import { mulberry32, hashSeed, randomInt, pickRandom, shuffle, shortId } from '@excalibur/shared';

describe('random (deterministic)', () => {
  it('mulberry32 is reproducible for a given seed', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
  it('different seeds diverge', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
  it('hashSeed is stable', () => {
    expect(hashSeed('excalibur')).toBe(hashSeed('excalibur'));
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
  });
  it('randomInt stays in range', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const n = randomInt(rng, 5, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(10);
    }
  });
  it('pickRandom returns a member, or undefined for empty', () => {
    const rng = mulberry32(3);
    expect(['a', 'b', 'c']).toContain(pickRandom(rng, ['a', 'b', 'c']));
    expect(pickRandom(rng, [])).toBeUndefined();
  });
  it('shuffle is a permutation and deterministic', () => {
    const items = [1, 2, 3, 4, 5];
    const s1 = shuffle(mulberry32(9), items);
    const s2 = shuffle(mulberry32(9), items);
    expect(s1).toEqual(s2);
    expect([...s1].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]); // original untouched
  });
  it('shortId has the requested length and stable for a seed', () => {
    expect(shortId(mulberry32(1), 10)).toHaveLength(10);
    expect(shortId(mulberry32(1))).toBe(shortId(mulberry32(1)));
  });
});

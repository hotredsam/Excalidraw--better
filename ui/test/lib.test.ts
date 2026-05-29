import { describe, it, expect } from 'vitest';
import { fuzzyScore, filterCommands } from '../src/lib/commands';
import { normalizeAccelerator } from '../src/lib/shortcuts';

describe('renderer command fuzzy search', () => {
  it('scores subsequence matches and rejects non-matches', () => {
    expect(fuzzyScore('exp', 'Export…')).toBeGreaterThan(0);
    expect(fuzzyScore('zz', 'Export…')).toBe(-1);
    expect(fuzzyScore('', 'anything')).toBe(0);
  });
  it('ranks word-start matches higher', () => {
    expect(fuzzyScore('s', 'Save')).toBeGreaterThan(fuzzyScore('s', 'Insert'));
  });
  it('filters commands by query', () => {
    const cmds = [
      { id: 'a', title: 'Save', category: 'File', source: 'core' },
      { id: 'b', title: 'Export', category: 'File', source: 'core' },
    ];
    const res = filterCommands(cmds as any, 'exp');
    expect(res.map((c) => c.id)).toEqual(['b']);
    expect(filterCommands(cmds as any, '')).toHaveLength(2);
  });
});

describe('renderer accelerator normalization', () => {
  it('matches the shared implementation behaviour', () => {
    expect(normalizeAccelerator({ key: 's', ctrlKey: true })).toBe('Ctrl+S');
    expect(normalizeAccelerator({ key: 'k', metaKey: true })).toBe('Ctrl+K');
    expect(normalizeAccelerator({ key: 'P', ctrlKey: true, shiftKey: true })).toBe('Ctrl+Shift+P');
    expect(normalizeAccelerator({ key: 'ArrowRight' })).toBe('Right');
    expect(normalizeAccelerator({ key: 'Shift', shiftKey: true })).toBe('Shift');
  });
});

import { describe, it, expect } from 'vitest';
import { NavigationHistory } from '../src/lib/history';

describe('NavigationHistory', () => {
  it('navigates back and forward', () => {
    const h = new NavigationHistory<string>();
    h.push('/a');
    h.push('/b');
    h.push('/c');
    expect(h.current()).toBe('/c');
    expect(h.canForward()).toBe(false);
    expect(h.back()).toBe('/b');
    expect(h.back()).toBe('/a');
    expect(h.canBack()).toBe(false);
    expect(h.forward()).toBe('/b');
  });

  it('truncates forward entries when pushing after going back', () => {
    const h = new NavigationHistory<string>();
    h.push('/a');
    h.push('/b');
    h.back();
    h.push('/c');
    expect(h.canForward()).toBe(false);
    expect(h.current()).toBe('/c');
    expect(h.size()).toBe(2);
  });

  it('ignores consecutive duplicates', () => {
    const h = new NavigationHistory<string>();
    h.push('/a');
    h.push('/a');
    expect(h.size()).toBe(1);
  });

  it('respects the limit', () => {
    const h = new NavigationHistory<number>(3);
    for (let i = 0; i < 5; i++) h.push(i);
    expect(h.size()).toBe(3);
    expect(h.current()).toBe(4);
  });

  it('returns null when navigation is not possible', () => {
    const h = new NavigationHistory<string>();
    expect(h.back()).toBeNull();
    expect(h.forward()).toBeNull();
    expect(h.current()).toBeNull();
  });
});

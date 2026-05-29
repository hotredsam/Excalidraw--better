import { describe, it, expect } from 'vitest';
import { basename, dirname, extname, stripExt, joinSegments, relativeTo, segments, depth, normalizeSlashes } from '@excalibur/shared';

describe('pathlike', () => {
  it('normalizeSlashes', () => {
    expect(normalizeSlashes('a\\b\\c')).toBe('a/b/c');
  });
  it('basename', () => {
    expect(basename('/a/b/file.excalidraw')).toBe('file.excalidraw');
    expect(basename('/a/b/')).toBe('b');
    expect(basename('file.png')).toBe('file.png');
  });
  it('dirname', () => {
    expect(dirname('/a/b/c.txt')).toBe('/a/b');
    expect(dirname('/a')).toBe('/');
    expect(dirname('file')).toBe('.');
  });
  it('extname / stripExt', () => {
    expect(extname('a/b.excalidraw')).toBe('.excalidraw');
    expect(extname('.hidden')).toBe('');
    expect(stripExt('/a/b.excalidraw')).toBe('/a/b');
  });
  it('joinSegments', () => {
    expect(joinSegments('/a', 'b', 'c.txt')).toBe('/a/b/c.txt');
    expect(joinSegments('a/', '/b/', 'c')).toBe('a/b/c');
  });
  it('relativeTo', () => {
    expect(relativeTo('/ws', '/ws/a/b.excalidraw')).toBe('a/b.excalidraw');
    expect(relativeTo('/ws', '/ws')).toBe('');
    expect(relativeTo('/ws', '/other/x')).toBe('/other/x');
  });
  it('segments / depth', () => {
    expect(segments('/a/b/c')).toEqual(['a', 'b', 'c']);
    expect(depth('/a/b/c')).toBe(3);
    expect(depth('/')).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { parseFrontmatter, stringifyFrontmatter } from '@excalibur/shared';
import { planBatchExport } from '../src/main/export-batch';

describe('frontmatter', () => {
  it('parses scalars, booleans, numbers and inline arrays', () => {
    const text = ['---', 'title: "My Doc"', 'count: 3', 'draft: true', 'tags: ["a", "b"]', '---', '', '# Body'].join('\n');
    const { data, body } = parseFrontmatter(text);
    expect(data.title).toBe('My Doc');
    expect(data.count).toBe(3);
    expect(data.draft).toBe(true);
    expect(data.tags).toEqual(['a', 'b']);
    expect(body.trim()).toBe('# Body');
  });

  it('returns the whole text as body when there is no frontmatter', () => {
    const { data, body } = parseFrontmatter('just content');
    expect(data).toEqual({});
    expect(body).toBe('just content');
  });

  it('round-trips through stringify/parse', () => {
    const fm = stringifyFrontmatter({ title: 'X', tags: ['t1', 't2'], n: 5, ok: false }, '# Hello\n');
    const { data, body } = parseFrontmatter(fm);
    expect(data).toEqual({ title: 'X', tags: ['t1', 't2'], n: 5, ok: false });
    expect(body.trim()).toBe('# Hello');
  });

  it('stringify with no data returns the body unchanged', () => {
    expect(stringifyFrontmatter({}, 'body')).toBe('body');
  });
});

describe('planBatchExport', () => {
  const presets = [
    { id: 'web', label: 'Web', format: 'png' as const, scale: 1, background: true, darkMode: false, nameTemplate: '{name}-web' },
    { id: 'print', label: 'Print', format: 'png' as const, scale: 3, background: true, darkMode: false, nameTemplate: '{name}-print' },
    { id: 'vector', label: 'SVG', format: 'svg' as const, scale: 1, background: true, darkMode: false, nameTemplate: '{name}' },
    { id: 'json', label: 'JSON', format: 'json' as const, scale: 1, background: false, darkMode: false, nameTemplate: '{name}' },
  ];

  it('computes per-preset output paths with correct extensions', () => {
    const items = planBatchExport('/ws', 'diagram', presets);
    expect(items.map((i) => path.basename(i.outputPath))).toEqual([
      'diagram-web.png',
      'diagram-print.png',
      'diagram.svg',
      'diagram.excalidraw',
    ]);
    expect(items[0].outputPath.startsWith(path.join('/ws', 'exports'))).toBe(true);
  });

  it('disambiguates colliding output names', () => {
    const dup = [presets[2], { ...presets[2], id: 'vector2' }];
    const items = planBatchExport('/ws', 'd', dup);
    expect(path.basename(items[0].outputPath)).toBe('d.svg');
    expect(path.basename(items[1].outputPath)).toBe('d-2.svg');
  });
});

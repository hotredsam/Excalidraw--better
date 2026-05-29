import { describe, it, expect } from 'vitest';
import {
  applyRenameTemplate,
  extractSlidesFromScene,
  buildMarkdown,
  parseGitStatus,
  fuzzyScore,
  filterCommands,
} from '@excalibur/shared';

describe('applyRenameTemplate', () => {
  it('expands {name} {n} {ext} with padding', () => {
    expect(applyRenameTemplate('{name}-{n}', { name: 'draw', ext: '.excalidraw', n: 3, padWidth: 3 })).toBe(
      'draw-003.excalidraw',
    );
  });
  it('keeps a single extension', () => {
    expect(applyRenameTemplate('{name}', { name: 'a', ext: '.png', n: 1 })).toBe('a.png');
    expect(applyRenameTemplate('{name}{ext}', { name: 'a', ext: '.png', n: 1 })).toBe('a.png');
  });
  it('expands date tokens', () => {
    const d = new Date('2026-05-29T10:20:00');
    expect(applyRenameTemplate('{YYYY}{MM}{DD}', { name: 'x', ext: '.svg', n: 1, date: d })).toBe('20260529.svg');
  });
});

describe('extractSlidesFromScene', () => {
  it('returns ordered slides from frames (reading order)', () => {
    const scene = {
      elements: [
        { id: 'f2', type: 'frame', x: 400, y: 0, width: 300, height: 200, name: 'Two' },
        { id: 'f1', type: 'frame', x: 0, y: 0, width: 300, height: 200, name: 'One' },
        { id: 'f3', type: 'frame', x: 0, y: 400, width: 300, height: 200, name: 'Three' },
      ],
    };
    const slides = extractSlidesFromScene(scene);
    expect(slides.map((s) => s.id)).toEqual(['f1', 'f2', 'f3']);
    expect(slides[0].index).toBe(0);
  });
  it('falls back to a single full-canvas slide when no frames', () => {
    const scene = { elements: [{ type: 'rectangle', x: 10, y: 10, width: 100, height: 50 }] };
    const slides = extractSlidesFromScene(scene);
    expect(slides.length).toBe(1);
    expect(slides[0].id).toBe('all');
  });
  it('returns empty for empty scenes', () => {
    expect(extractSlidesFromScene({ elements: [] })).toEqual([]);
  });
});

describe('buildMarkdown', () => {
  it('includes frontmatter, title, image and notes', () => {
    const md = buildMarkdown(
      { includeFrontmatter: true, imageFormat: 'png', title: 'My Diagram', tags: ['a', 'b'] },
      './my-diagram.png',
      'some notes',
    );
    expect(md).toContain('title: "My Diagram"');
    expect(md).toContain('tags: ["a", "b"]');
    expect(md).toContain('![My Diagram](./my-diagram.png)');
    expect(md).toContain('## Notes');
  });
  it('omits frontmatter when disabled', () => {
    const md = buildMarkdown({ includeFrontmatter: false, imageFormat: 'svg', tags: [] }, './x.svg');
    expect(md.startsWith('---')).toBe(false);
  });
});

describe('parseGitStatus', () => {
  it('parses branch, ahead/behind and file states', () => {
    const out = ['## main...origin/main [ahead 2, behind 1]', ' M src/app.ts', '?? new.txt', 'A  added.ts'].join('\n');
    const st = parseGitStatus(out);
    expect(st.isRepo).toBe(true);
    expect(st.branch).toBe('main');
    expect(st.ahead).toBe(2);
    expect(st.behind).toBe(1);
    expect(st.files.length).toBe(3);
    expect(st.clean).toBe(false);
  });
  it('reports clean for branch-only output', () => {
    expect(parseGitStatus('## main').clean).toBe(true);
  });
});

describe('fuzzy command search', () => {
  it('scores word-start matches higher and rejects non-subsequences', () => {
    expect(fuzzyScore('exp', 'Export as PNG')).toBeGreaterThan(0);
    expect(fuzzyScore('zzz', 'Export as PNG')).toBe(-1);
  });
  it('filters and ranks commands', () => {
    const cmds = [
      { id: '1', title: 'Save', category: 'File', source: 'core' },
      { id: '2', title: 'Save As', category: 'File', source: 'core' },
      { id: '3', title: 'Export', category: 'File', source: 'core' },
    ];
    const res = filterCommands(cmds as any, 'save');
    expect(res.map((c) => c.id)).toContain('1');
    expect(res.find((c) => c.id === '3')).toBeUndefined();
  });
});

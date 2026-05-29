import { describe, it, expect } from 'vitest';
import { countElementsByType, stripDeleted, isEmptyScene, sceneSummary, mergeScenes, blankScene } from '@excalibur/shared';

const scene = {
  type: 'excalidraw',
  elements: [
    { id: '1', type: 'rectangle' },
    { id: '2', type: 'rectangle', isDeleted: true },
    { id: '3', type: 'text', text: 'hello' },
    { id: '4', type: 'frame' },
  ],
  files: { f1: { id: 'f1' } },
};

describe('scene-utils', () => {
  it('countElementsByType ignores deleted', () => {
    expect(countElementsByType(scene)).toEqual({ rectangle: 1, text: 1, frame: 1 });
  });
  it('stripDeleted removes deleted elements', () => {
    expect(stripDeleted(scene).elements).toHaveLength(3);
  });
  it('isEmptyScene', () => {
    expect(isEmptyScene(scene)).toBe(false);
    expect(isEmptyScene({ elements: [{ id: 'x', isDeleted: true }] })).toBe(true);
    expect(isEmptyScene(blankScene())).toBe(true);
  });
  it('sceneSummary', () => {
    const s = sceneSummary(scene);
    expect(s.total).toBe(4);
    expect(s.visible).toBe(3);
    expect(s.deleted).toBe(1);
    expect(s.hasFrames).toBe(true);
    expect(s.textLength).toBe(5);
  });
  it('mergeScenes combines elements and files', () => {
    const merged = mergeScenes(scene, { elements: [{ id: '5', type: 'ellipse' }], files: { f2: { id: 'f2' } } });
    expect(merged.elements).toHaveLength(5);
    expect(Object.keys(merged.files)).toEqual(['f1', 'f2']);
  });
  it('blankScene shape', () => {
    const b = blankScene('test');
    expect(b.type).toBe('excalidraw');
    expect(b.source).toBe('test');
    expect(b.elements).toEqual([]);
  });
});

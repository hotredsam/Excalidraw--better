/** Helpers for inspecting and manipulating Excalidraw scenes (pure). */

export interface SceneSummary {
  total: number;
  visible: number;
  deleted: number;
  byType: Record<string, number>;
  hasFrames: boolean;
  textLength: number;
}

function elementsOf(scene: any): any[] {
  return Array.isArray(scene?.elements) ? scene.elements : [];
}

export function countElementsByType(scene: any): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const el of elementsOf(scene)) {
    if (el?.isDeleted) continue;
    const t = el?.type || 'unknown';
    counts[t] = (counts[t] || 0) + 1;
  }
  return counts;
}

export function stripDeleted(scene: any): any {
  return { ...scene, elements: elementsOf(scene).filter((e) => !e?.isDeleted) };
}

export function isEmptyScene(scene: any): boolean {
  return elementsOf(scene).filter((e) => !e?.isDeleted).length === 0;
}

export function sceneSummary(scene: any): SceneSummary {
  const els = elementsOf(scene);
  const visible = els.filter((e) => !e?.isDeleted);
  const deleted = els.length - visible.length;
  let textLength = 0;
  for (const e of visible) if (typeof e?.text === 'string') textLength += e.text.length;
  return {
    total: els.length,
    visible: visible.length,
    deleted,
    byType: countElementsByType(scene),
    hasFrames: visible.some((e) => e?.type === 'frame'),
    textLength,
  };
}

/** Merge two scenes' elements and files (b appended after a). */
export function mergeScenes(a: any, b: any): any {
  return {
    ...a,
    elements: [...elementsOf(a), ...elementsOf(b)],
    files: { ...(a?.files || {}), ...(b?.files || {}) },
  };
}

/** Produce a blank scene shell. */
export function blankScene(source = 'excalibur'): any {
  return { type: 'excalidraw', version: 2, source, elements: [], appState: {}, files: {} };
}

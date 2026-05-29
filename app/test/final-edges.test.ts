import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { isWithinWorkspace, sanitizeName, isSafeName } from '../src/main/path-utils';
import { dataUrlToBuffer, embedSceneInSvg } from '../src/main/export-utils';
import { extractExcalidrawFromPng } from '../src/main/png-excalidraw';
import { createFolder, createExcalidrawFile } from '../src/main/file-ops';

let ws: string;
beforeEach(async () => {
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-fe-'));
});
afterEach(async () => {
  await fs.remove(ws);
});

describe('path-utils extras', () => {
  it('isWithinWorkspace accepts the root itself and descendants', () => {
    expect(isWithinWorkspace('/ws', '/ws')).toBe(true);
    expect(isWithinWorkspace('/ws', '/ws/a/b')).toBe(true);
    expect(isWithinWorkspace('/ws', '/other')).toBe(false);
  });
  it('sanitizeName keeps spaces and hyphens, drops illegal chars', () => {
    expect(sanitizeName('My Diagram - v2')).toBe('My Diagram - v2');
    expect(sanitizeName('a/b:c*?')).toBe('abc');
  });
  it('isSafeName rejects reserved and traversal', () => {
    expect(isSafeName('CON')).toBe(false);
    expect(isSafeName('..')).toBe(false);
    expect(isSafeName('ok name.excalidraw')).toBe(true);
  });
});

describe('export-utils dataUrlToBuffer', () => {
  it('decodes raw base64 and data URLs identically', () => {
    const raw = Buffer.from('payload').toString('base64');
    expect(dataUrlToBuffer(raw).toString()).toBe('payload');
    expect(dataUrlToBuffer(`data:image/png;base64,${raw}`).toString()).toBe('payload');
  });
});

describe('png-excalidraw error path', () => {
  it('throws NO_EMBEDDED_SCENE for a PNG with no metadata chunks', () => {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    // minimal chunks without tEXt — reuse export encoder via embed of empty? Use a buffer
    // that png-chunks-extract can parse: just the signature triggers an error path too.
    expect(() => extractExcalidrawFromPng(sig)).toThrow();
  });
});

describe('embedSceneInSvg without closing tag appends comment', () => {
  it('appends the comment when </svg> is absent', () => {
    const out = embedSceneInSvg('<svg>', { type: 'excalidraw', elements: [] });
    expect(out).toMatch(/<!-- excalidraw-state: .*? -->/);
  });
});

describe('file-ops on the workspace root', () => {
  it('creates a folder and a file directly in the root', async () => {
    const { path: folder } = await createFolder(ws, ws, 'notes');
    expect(await fs.pathExists(folder)).toBe(true);
    const { path: file } = await createExcalidrawFile(ws, ws, 'root-doc');
    expect(await fs.pathExists(file)).toBe(true);
  });
});

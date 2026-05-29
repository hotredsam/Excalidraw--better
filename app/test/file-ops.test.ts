import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  renameEntry,
  moveEntry,
  copyEntry,
  createExcalidrawFile,
  createFolder,
} from '../src/main/file-ops';

let ws: string;

beforeEach(async () => {
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-ws-'));
});
afterEach(async () => {
  await fs.remove(ws);
});

describe('file-ops', () => {
  it('creates a new .excalidraw file with a valid blank scene', async () => {
    const { path: p } = await createExcalidrawFile(ws, ws, 'My Drawing');
    expect(p.endsWith('My Drawing.excalidraw')).toBe(true);
    const scene = await fs.readJson(p);
    expect(scene.type).toBe('excalidraw');
    expect(scene.elements).toEqual([]);
  });

  it('does not double the extension', async () => {
    const { path: p } = await createExcalidrawFile(ws, ws, 'foo.excalidraw');
    expect(path.basename(p)).toBe('foo.excalidraw');
  });

  it('renames a file', async () => {
    const { path: p } = await createExcalidrawFile(ws, ws, 'a');
    const { path: renamed } = await renameEntry(ws, p, 'b.excalidraw');
    expect(await fs.pathExists(renamed)).toBe(true);
    expect(await fs.pathExists(p)).toBe(false);
  });

  it('copies a file with a "copy" suffix', async () => {
    const { path: p } = await createExcalidrawFile(ws, ws, 'a');
    const { path: copied } = await copyEntry(ws, p);
    expect(path.basename(copied)).toBe('a copy.excalidraw');
    expect(await fs.pathExists(copied)).toBe(true);
  });

  it('moves a file into a subfolder', async () => {
    const { path: folder } = await createFolder(ws, ws, 'sub');
    const { path: p } = await createExcalidrawFile(ws, ws, 'a');
    const { path: moved } = await moveEntry(ws, p, folder);
    expect(moved).toBe(path.join(folder, 'a.excalidraw'));
    expect(await fs.pathExists(moved)).toBe(true);
  });

  it('refuses traversal outside the workspace', async () => {
    const { path: p } = await createExcalidrawFile(ws, ws, 'a');
    await expect(renameEntry(ws, p, '../escape.excalidraw')).rejects.toThrow(/Invalid name/);
    await expect(moveEntry(ws, p, path.join(ws, '..'))).rejects.toThrow(/outside workspace/);
  });

  it('refuses to overwrite an existing file on rename', async () => {
    const { path: a } = await createExcalidrawFile(ws, ws, 'a');
    await createExcalidrawFile(ws, ws, 'b');
    await expect(renameEntry(ws, a, 'b.excalidraw')).rejects.toThrow(/already exists/);
  });
});

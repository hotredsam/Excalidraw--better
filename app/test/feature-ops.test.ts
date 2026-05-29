import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { bulkRename, bulkDelete, bulkMove } from '../src/main/bulk-ops';
import { buildImageInsertion, mimeForExt } from '../src/main/import-pack';
import { GitHelper, GitRunner } from '../src/main/git-helper';
import { getDeck, setSlideNotes } from '../src/main/presentation';
import { writeMarkdownBundle } from '../src/main/markdown';
import { buildCommandList } from '../src/main/command-registry';

let ws: string;
beforeEach(async () => {
  ws = await fs.mkdtemp(path.join(os.tmpdir(), 'excalibur-ops-'));
});
afterEach(async () => {
  await fs.remove(ws);
});

describe('bulk-ops', () => {
  it('bulk renames with a numbered template', async () => {
    for (const n of ['x', 'y', 'z']) await fs.writeJson(path.join(ws, `${n}.excalidraw`), {});
    const files = ['x', 'y', 'z'].map((n) => path.join(ws, `${n}.excalidraw`));
    const res = await bulkRename(ws, files, { template: 'diagram-{n}', startIndex: 1, padWidth: 2 });
    expect(res.ok).toBe(true);
    expect(res.processed).toBe(3);
    expect(await fs.pathExists(path.join(ws, 'diagram-01.excalidraw'))).toBe(true);
    expect(await fs.pathExists(path.join(ws, 'diagram-03.excalidraw'))).toBe(true);
  });

  it('bulk delete uses the injected deleter and reports per item', async () => {
    const a = path.join(ws, 'a.excalidraw');
    await fs.writeJson(a, {});
    const deleted: string[] = [];
    const res = await bulkDelete(ws, [a, '/outside.txt'], async (p) => {
      deleted.push(p);
    });
    expect(res.processed).toBe(1);
    expect(res.failed).toBe(1);
    expect(deleted).toEqual([a]);
  });

  it('bulk move relocates into a subfolder', async () => {
    const a = path.join(ws, 'a.excalidraw');
    await fs.writeJson(a, {});
    const dest = path.join(ws, 'archive');
    const res = await bulkMove(ws, [a], dest);
    expect(res.ok).toBe(true);
    expect(await fs.pathExists(path.join(dest, 'a.excalidraw'))).toBe(true);
  });
});

describe('import-pack', () => {
  it('maps extensions to mime types', () => {
    expect(mimeForExt('.png')).toBe('image/png');
    expect(mimeForExt('.svg')).toBe('image/svg+xml');
    expect(mimeForExt('.xyz')).toBeNull();
  });

  it('builds an image element + file from a PNG', async () => {
    const png = path.join(ws, 'pic.png');
    await fs.writeFile(png, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const ins = await buildImageInsertion(png, { x: 50, y: 60, width: 100, height: 80 });
    expect(ins.element.type).toBe('image');
    expect(ins.element.fileId).toBe(ins.file.id);
    expect(ins.file.dataURL.startsWith('data:image/png;base64,')).toBe(true);
    expect(ins.element.width).toBe(100);
  });

  it('rejects unsupported types', async () => {
    const bad = path.join(ws, 'f.xyz');
    await fs.writeFile(bad, 'x');
    await expect(buildImageInsertion(bad)).rejects.toThrow(/Unsupported/);
  });
});

describe('GitHelper (injected runner)', () => {
  const transcript: string[][] = [];
  const runner: GitRunner = async (args) => {
    transcript.push(args);
    if (args[0] === 'status') return { stdout: '## main\n M a.ts\n', stderr: '' };
    if (args[0] === 'commit') return { stdout: '[main abc123] msg', stderr: '' };
    return { stdout: '', stderr: '' };
  };

  it('parses status and runs add+commit', async () => {
    const git = new GitHelper(ws, runner);
    const st = await git.status();
    expect(st.branch).toBe('main');
    expect(st.files.length).toBe(1);

    const out = await git.commit('msg');
    expect(out).toContain('abc123');
    expect(transcript.some((a) => a[0] === 'add')).toBe(true);
    expect(transcript.some((a) => a[0] === 'commit')).toBe(true);
  });

  it('reports isRepo:false when git fails', async () => {
    const failing: GitRunner = async () => {
      throw new Error('not a repo');
    };
    const git = new GitHelper(ws, failing);
    expect((await git.status()).isRepo).toBe(false);
  });

  it('rejects empty commit messages', async () => {
    const git = new GitHelper(ws, runner);
    await expect(git.commit('  ')).rejects.toThrow(/message required/);
  });
});

describe('presentation notes', () => {
  it('derives slides and persists per-slide notes', async () => {
    const scene = { elements: [{ id: 'f1', type: 'frame', x: 0, y: 0, width: 100, height: 100, name: 'Intro' }] };
    await setSlideNotes(ws, 'deck.excalidraw', 'f1', 'Welcome the audience');
    const deck = await getDeck(ws, 'deck.excalidraw', scene);
    expect(deck.slides.length).toBe(1);
    expect(deck.slides[0].notes).toBe('Welcome the audience');
  });
});

describe('markdown bundle', () => {
  it('writes an image and a referencing markdown file', async () => {
    // tiny valid-ish svg
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const bundle = await writeMarkdownBundle(
      ws,
      'My Drawing',
      { includeFrontmatter: true, imageFormat: 'svg', tags: ['demo'] },
      svg,
      { type: 'excalidraw', elements: [] },
      'notes here',
    );
    expect(await fs.pathExists(bundle.imagePath)).toBe(true);
    const md = await fs.readFile(bundle.markdownPath, 'utf-8');
    expect(md).toContain('![');
    expect(md).toContain('demo');
  });
});

describe('command registry', () => {
  it('merges core commands with plugin contributions', () => {
    const list = buildCommandList({
      toolbar: [{ id: 'p-tb', title: 'Batch' }],
      commands: [{ id: 'p-cmd', title: 'Do thing' }],
      panels: [],
      exportPresets: [],
    } as any);
    expect(list.find((c) => c.id === 'core.save')).toBeTruthy();
    expect(list.find((c) => c.id === 'p-cmd')?.source).toBe('plugin');
    expect(list.find((c) => c.id === 'p-tb')?.source).toBe('plugin');
  });
});

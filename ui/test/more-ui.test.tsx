import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { PropertiesPanel } from '../src/components/PropertiesPanel';
import { SettingsModal } from '../src/components/SettingsModal';
import { WorkspaceSidebar } from '../src/components/WorkspaceSidebar';
import { GitPanel } from '../src/components/GitPanel';
import { OutlinePanel } from '../src/components/OutlinePanel';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };
const file = { name: 'a.excalidraw', path: '/vault/a.excalidraw', isDirectory: false, size: 100, mtime: 1, extension: '.excalidraw' };

beforeEach(() => installFakeApi());

describe('PropertiesPanel tag removal', () => {
  it('removes an existing tag', async () => {
    const { api } = installFakeApi({ tags: { 'a.excalidraw': ['keepme'] } });
    render(<PropertiesPanel activeFile={file} activeWorkspace={ws} presets={[]} onExport={async () => {}} />);
    expect(await screen.findByText('keepme')).toBeInTheDocument();
    fireEvent.click(screen.getByText('×'));
    await waitFor(() => expect(api.workspaces.setTags).toHaveBeenCalledWith('w1', file.path, []));
  });
});

describe('SettingsModal theme select', () => {
  it('updates the theme setting', async () => {
    const { api } = installFakeApi();
    render(<SettingsModal isOpen onClose={() => {}} />);
    const select = await screen.findByDisplayValue('Dark');
    fireEvent.change(select, { target: { value: 'light' } });
    await waitFor(() => expect(api.settings.update).toHaveBeenCalledWith({ theme: 'light' }));
  });
});

describe('WorkspaceSidebar new folder', () => {
  it('creates a folder via the prompt', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('archive');
    const { api } = installFakeApi();
    render(<WorkspaceSidebar onOpenFile={() => {}} />);
    fireEvent.click(await screen.findByText('+ Folder'));
    await waitFor(() => expect(api.workspaces.createFolder).toHaveBeenCalled());
  });
});

describe('GitPanel with changes', () => {
  it('renders changed files and commits', async () => {
    const { api } = installFakeApi();
    api.git.status = vi.fn(async () => ({
      isRepo: true,
      branch: 'main',
      ahead: 0,
      behind: 0,
      clean: false,
      files: [{ path: 'a.ts', index: 'M', working: '' }],
    })) as any;
    api.git.log = vi.fn(async () => ({ entries: [{ hash: 'abc', subject: 'init', date: '' }] })) as any;
    render(<GitPanel activeWorkspace={ws} />);
    expect(await screen.findByText('a.ts')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Commit message…');
    fireEvent.change(input, { target: { value: 'wip' } });
    fireEvent.click(screen.getByText('Commit all changes'));
    await waitFor(() => expect(api.git.commit).toHaveBeenCalledWith('w1', 'wip'));
  });
});

describe('OutlinePanel', () => {
  it('lists frames from the deck', async () => {
    const { api } = installFakeApi();
    api.presentation.getDeck = vi.fn(async () => ({
      slides: [
        { id: 'f1', name: 'Intro', index: 0, x: 0, y: 0, width: 1, height: 1, notes: '' },
        { id: 'f2', name: 'Body', index: 1, x: 0, y: 0, width: 1, height: 1, notes: '' },
      ],
    })) as any;
    const onGoTo = vi.fn();
    render(<OutlinePanel activeWorkspace={ws} activeFile={file} getScene={() => ({ elements: [] })} onGoTo={onGoTo} />);
    expect(await screen.findByText('Intro')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Body'));
    expect(onGoTo).toHaveBeenCalledWith('f2');
  });
});

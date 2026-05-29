import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { ExportDialog } from '../src/components/ExportDialog';
import { KeyboardHelpOverlay } from '../src/components/KeyboardHelpOverlay';
import { PresentationMode } from '../src/components/PresentationMode';
import { RecentsPanel } from '../src/components/RecentsPanel';
import { LibrariesPanel } from '../src/components/LibrariesPanel';
import { BackupsPanel } from '../src/components/BackupsPanel';
import { GitPanel } from '../src/components/GitPanel';
import { StatusBar } from '../src/components/StatusBar';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };
const file = { name: 'a.excalidraw', path: '/vault/a.excalidraw', isDirectory: false, size: 10, mtime: 1, extension: '.excalidraw' };

beforeEach(() => installFakeApi());

describe('ExportDialog format options', () => {
  it('hides the scale control for JSON exports', () => {
    render(<ExportDialog open onClose={() => {}} onExport={async () => {}} baseName="d" />);
    expect(screen.getByText('Scale')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('PNG (raster)'), { target: { value: 'json' } });
    expect(screen.queryByText('Scale')).not.toBeInTheDocument();
  });
  it('renders nothing when closed', () => {
    const { container } = render(<ExportDialog open={false} onClose={() => {}} onExport={async () => {}} baseName="d" />);
    expect(container.firstChild).toBeNull();
  });
});

describe('KeyboardHelpOverlay', () => {
  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay open onClose={onClose} />);
    await screen.findByText('Keyboard shortcuts');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('PresentationMode keyboard nav', () => {
  it('advances on ArrowRight and exits on Escape', () => {
    const deck = { slides: [
      { id: 's1', name: 'One', index: 0, x: 0, y: 0, width: 1, height: 1, notes: '' },
      { id: 's2', name: 'Two', index: 1, x: 0, y: 0, width: 1, height: 1, notes: '' },
    ] };
    const onIndex = vi.fn();
    const onExit = vi.fn();
    render(<PresentationMode deck={deck} index={0} onIndex={onIndex} onExit={onExit} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onIndex).toHaveBeenCalledWith(1);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onExit).toHaveBeenCalled();
  });
});

describe('RecentsPanel clear', () => {
  it('calls clear', async () => {
    const { api } = installFakeApi({ recents: [{ path: '/a', name: 'a', workspaceId: 'w1', workspaceName: 'V', openedAt: 1 }] });
    render(<RecentsPanel onOpenRecent={() => {}} />);
    expect(await screen.findByText('a')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear'));
    await waitFor(() => expect(api.recents.clear).toHaveBeenCalled());
  });
});

describe('LibrariesPanel import', () => {
  it('invokes the import dialog', async () => {
    const { api } = installFakeApi();
    render(<LibrariesPanel onInsertLibrary={() => {}} onSaveSelection={() => {}} />);
    fireEvent.click(await screen.findByText('+ Import .excalidrawlib'));
    await waitFor(() => expect(api.libraries.import).toHaveBeenCalled());
  });
});

describe('BackupsPanel restore', () => {
  it('lists and restores a backup', async () => {
    const { api } = installFakeApi();
    api.backups.list = vi.fn(async () => ({ backups: [{ id: 'b1', originalPath: file.path, backupPath: '/x', createdAt: Date.now(), size: 1 }] })) as any;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<BackupsPanel activeFile={file} />);
    fireEvent.click(await screen.findByText('Restore'));
    await waitFor(() => expect(api.backups.restore).toHaveBeenCalled());
  });
});

describe('GitPanel init', () => {
  it('initializes a repo when not present', async () => {
    const { api } = installFakeApi();
    render(<GitPanel activeWorkspace={ws} />);
    fireEvent.click(await screen.findByText('git init'));
    await waitFor(() => expect(api.git.init).toHaveBeenCalled());
  });
});

describe('StatusBar saved state', () => {
  it('shows saved when not dirty', () => {
    render(<StatusBar fileName="a" dirty={false} elementCount={1} autosave={false} workspaceName="V" theme="light" />);
    expect(screen.getByText('✓ saved')).toBeInTheDocument();
    expect(screen.getByText('autosave off')).toBeInTheDocument();
    expect(screen.getByText('1 element')).toBeInTheDocument();
  });
});

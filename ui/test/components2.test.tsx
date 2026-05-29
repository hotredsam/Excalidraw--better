import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { LibrariesPanel } from '../src/components/LibrariesPanel';
import { TemplatesPanel } from '../src/components/TemplatesPanel';
import { GitPanel } from '../src/components/GitPanel';
import { ReviewPanel } from '../src/components/ReviewPanel';
import { PluginManager } from '../src/components/PluginManager';
import { BackupsPanel } from '../src/components/BackupsPanel';
import { ExportDialog } from '../src/components/ExportDialog';
import { StatusBar } from '../src/components/StatusBar';
import { KeyboardHelpOverlay } from '../src/components/KeyboardHelpOverlay';
import { PresentationMode } from '../src/components/PresentationMode';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };
const file = { name: 'a.excalidraw', path: '/vault/a.excalidraw', isDirectory: false, size: 10, mtime: 1, extension: '.excalidraw' };

beforeEach(() => installFakeApi());

describe('LibrariesPanel', () => {
  it('shows the empty state and an import action', async () => {
    render(<LibrariesPanel onInsertLibrary={() => {}} onSaveSelection={() => {}} />);
    expect(await screen.findByText(/No libraries yet/)).toBeInTheDocument();
    expect(screen.getByText('+ Import .excalidrawlib')).toBeInTheDocument();
  });
});

describe('TemplatesPanel', () => {
  it('offers to save the current canvas', async () => {
    render(<TemplatesPanel onUseTemplate={() => {}} onSaveCurrent={async () => null} />);
    expect(await screen.findByText('+ Save current canvas as template')).toBeInTheDocument();
  });
});

describe('GitPanel', () => {
  it('offers git init for a non-repo workspace', async () => {
    render(<GitPanel activeWorkspace={ws} />);
    expect(await screen.findByText(/not a git repository/)).toBeInTheDocument();
    expect(screen.getByText('git init')).toBeInTheDocument();
  });
});

describe('ReviewPanel', () => {
  it('adds a comment pin', async () => {
    render(<ReviewPanel activeWorkspace={ws} activeFile={file} author="You" />);
    const ta = await screen.findByPlaceholderText('Add a review comment…');
    fireEvent.change(ta, { target: { value: 'Needs work' } });
    fireEvent.click(screen.getByText('Add comment'));
    await waitFor(() => expect(screen.getByText('hi')).toBeInTheDocument());
  });
  it('prompts to open a drawing when none active', () => {
    render(<ReviewPanel activeWorkspace={ws} activeFile={null} author="You" />);
    expect(screen.getByText(/Open a drawing to leave review comments/)).toBeInTheDocument();
  });
});

describe('PluginManager', () => {
  it('renders the install action and plugin count', async () => {
    render(<PluginManager />);
    expect(await screen.findByText('+ Install from folder')).toBeInTheDocument();
  });
});

describe('BackupsPanel', () => {
  it('shows the no-backups state', async () => {
    render(<BackupsPanel activeFile={file} />);
    expect(await screen.findByText(/No backups yet/)).toBeInTheDocument();
  });
});

describe('ExportDialog', () => {
  it('exports with the chosen format', async () => {
    const onExport = vi.fn(async () => {});
    render(<ExportDialog open onClose={() => {}} onExport={onExport} baseName="drawing" />);
    fireEvent.change(screen.getByDisplayValue('PNG (raster)'), { target: { value: 'svg' } });
    fireEvent.click(screen.getByText('Export'));
    await waitFor(() => expect(onExport).toHaveBeenCalled());
    expect(onExport.mock.calls[0][0].format).toBe('svg');
  });
});

describe('StatusBar', () => {
  it('reflects dirty state and element count', () => {
    render(<StatusBar fileName="a.excalidraw" dirty elementCount={5} autosave workspaceName="Vault" theme="dark" />);
    expect(screen.getByText('● unsaved')).toBeInTheDocument();
    expect(screen.getByText('5 elements')).toBeInTheDocument();
    expect(screen.getByText('autosave on')).toBeInTheDocument();
  });
});

describe('KeyboardHelpOverlay', () => {
  it('lists commands grouped with accelerators', async () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />);
    expect(await screen.findByText('Keyboard shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

describe('PresentationMode', () => {
  it('navigates slides and shows notes', () => {
    const deck = { slides: [
      { id: 's1', name: 'Intro', index: 0, x: 0, y: 0, width: 1, height: 1, notes: 'Welcome' },
      { id: 's2', name: 'Body', index: 1, x: 0, y: 0, width: 1, height: 1, notes: '' },
    ] };
    const onIndex = vi.fn();
    render(<PresentationMode deck={deck} index={0} onIndex={onIndex} onExit={() => {}} />);
    expect(screen.getByText('Intro')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Next →'));
    expect(onIndex).toHaveBeenCalledWith(1);
  });
  it('shows a hint when there are no frames', () => {
    render(<PresentationMode deck={{ slides: [] }} index={0} onIndex={() => {}} onExit={() => {}} />);
    expect(screen.getByText(/No frames found/)).toBeInTheDocument();
  });
});

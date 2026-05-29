import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { TagBrowser } from '../src/components/TagBrowser';
import { CommandPalette } from '../src/components/CommandPalette';
import { ExportDialog } from '../src/components/ExportDialog';
import { RecentsPanel } from '../src/components/RecentsPanel';
import { PluginManager } from '../src/components/PluginManager';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };

beforeEach(() => installFakeApi());

describe('TagBrowser select flow', () => {
  it('selecting a tag lists matching files', async () => {
    const { api } = installFakeApi({
      tags: { 'a.excalidraw': ['infra'] },
      files: [{ name: 'a.excalidraw', path: '/vault/a.excalidraw', isDirectory: false, size: 1, mtime: 1, extension: '.excalidraw' }],
    });
    api.workspaces.search = vi.fn(async () => ({
      results: [{ name: 'a.excalidraw', path: '/vault/a.excalidraw', extension: '.excalidraw', mtime: 1, tags: ['infra'], matchedOn: ['tag'] }],
      indexed: 1,
    })) as any;
    const onOpen = vi.fn();
    render(<TagBrowser activeWorkspace={ws} onOpenFile={onOpen} />);
    fireEvent.click(await screen.findByText('infra · 1'));
    expect(await screen.findByText('📄 a.excalidraw')).toBeInTheDocument();
    fireEvent.click(screen.getByText('📄 a.excalidraw'));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('CommandPalette run via click', () => {
  it('runs the clicked command', async () => {
    const onRun = vi.fn();
    render(<CommandPalette open onClose={() => {}} onRun={onRun} />);
    fireEvent.click(await screen.findByText('Export…'));
    expect(onRun).toHaveBeenCalledWith('core.export');
  });
});

describe('ExportDialog JSON export', () => {
  it('exports json without scale', async () => {
    const onExport = vi.fn(async () => {});
    render(<ExportDialog open onClose={() => {}} onExport={onExport} baseName="d" />);
    fireEvent.change(screen.getByDisplayValue('PNG (raster)'), { target: { value: 'json' } });
    fireEvent.click(screen.getByText('Export'));
    await waitFor(() => expect(onExport).toHaveBeenCalled());
    expect(onExport.mock.calls[0][0].format).toBe('json');
  });
});

describe('RecentsPanel open', () => {
  it('opens a recent entry on click', async () => {
    installFakeApi({ recents: [{ path: '/vault/a.excalidraw', name: 'a.excalidraw', workspaceId: 'w1', workspaceName: 'Vault', openedAt: 1 }] });
    const onOpen = vi.fn();
    render(<RecentsPanel onOpenRecent={onOpen} />);
    fireEvent.click(await screen.findByText('a.excalidraw'));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('PluginManager toggle', () => {
  it('enables a disabled plugin', async () => {
    const { api } = installFakeApi({
      plugins: [{ id: 'p1', name: 'P1', version: '1', description: 'd', permissions: { filesystem: 'none', network: 'none' }, contributes: { toolbar: [], commands: [], panels: [], exportPresets: [] }, enabled: false, installedAt: 0, builtIn: false }],
    });
    render(<PluginManager />);
    const checkbox = await screen.findByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => expect(api.plugins.enable).toHaveBeenCalledWith('p1'));
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { PropertiesPanel } from '../src/components/PropertiesPanel';
import { WorkspaceSidebar } from '../src/components/WorkspaceSidebar';
import { SettingsModal } from '../src/components/SettingsModal';
import { ProfileSwitcher } from '../src/components/ProfileSwitcher';
import { TagBrowser } from '../src/components/TagBrowser';
import { CommandPalette } from '../src/components/CommandPalette';
import { AIImportLane } from '../src/components/AIImportLane';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };
const file = { name: 'a.excalidraw', path: '/vault/a.excalidraw', isDirectory: false, size: 2048, mtime: 1, extension: '.excalidraw' };

beforeEach(() => installFakeApi());

describe('PropertiesPanel', () => {
  it('renders file info, export presets and a tag editor', async () => {
    const onExport = vi.fn(async () => {});
    render(<PropertiesPanel activeFile={file} activeWorkspace={ws} presets={[]} onExport={onExport} />);
    expect(await screen.findByText('a.excalidraw')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    // default presets present
    expect(screen.getByText('↓ PNG (image)')).toBeInTheDocument();
    fireEvent.click(screen.getByText('↓ PNG (image)'));
    await waitFor(() => expect(onExport).toHaveBeenCalled());
  });

  it('adds a tag through the editor', async () => {
    const { api } = installFakeApi();
    render(<PropertiesPanel activeFile={file} activeWorkspace={ws} presets={[]} onExport={async () => {}} />);
    const input = await screen.findByPlaceholderText('Add tag…');
    fireEvent.change(input, { target: { value: 'urgent' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(api.workspaces.setTags).toHaveBeenCalled());
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('shows "No file open" when nothing is selected', () => {
    render(<PropertiesPanel activeFile={null} activeWorkspace={ws} presets={[]} onExport={async () => {}} />);
    expect(screen.getByText('No file open.')).toBeInTheDocument();
  });
});

describe('WorkspaceSidebar', () => {
  it('renders the workspace selector, search and new-file actions', async () => {
    render(<WorkspaceSidebar onOpenFile={() => {}} />);
    expect(await screen.findByText('Workspace')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('🔍 Search name, text, tags…')).toBeInTheDocument();
    expect(screen.getByText('+ Drawing')).toBeInTheDocument();
  });

  it('creates a new drawing and opens it', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('roadmap');
    const onOpen = vi.fn();
    const { api } = installFakeApi();
    render(<WorkspaceSidebar onOpenFile={onOpen} />);
    fireEvent.click(await screen.findByText('+ Drawing'));
    await waitFor(() => expect(api.workspaces.createFile).toHaveBeenCalled());
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('SettingsModal', () => {
  it('shows settings and toggles autosave', async () => {
    const { api } = installFakeApi();
    render(<SettingsModal isOpen onClose={() => {}} />);
    const checkbox = (await screen.findAllByRole('checkbox'))[0];
    fireEvent.click(checkbox);
    await waitFor(() => expect(api.settings.update).toHaveBeenCalled());
  });
  it('renders nothing when closed', () => {
    const { container } = render(<SettingsModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('ProfileSwitcher', () => {
  it('shows the active profile and a Manage entry', async () => {
    const onManage = vi.fn();
    render(<ProfileSwitcher onManage={onManage} />);
    expect(await screen.findByText('Default')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Manage profiles…'));
    expect(onManage).toHaveBeenCalled();
  });
});

describe('TagBrowser', () => {
  it('shows the empty state with no tags', async () => {
    render(<TagBrowser activeWorkspace={ws} onOpenFile={() => {}} />);
    expect(await screen.findByText(/No tags yet/)).toBeInTheDocument();
  });
  it('lists tags with counts', async () => {
    installFakeApi({ tags: { 'a.excalidraw': ['infra', 'backend'], 'b.excalidraw': ['infra'] } });
    render(<TagBrowser activeWorkspace={ws} onOpenFile={() => {}} />);
    expect(await screen.findByText('infra · 2')).toBeInTheDocument();
    expect(screen.getByText('backend · 1')).toBeInTheDocument();
  });
});

describe('CommandPalette keyboard navigation', () => {
  it('moves the active row with arrows and runs on Enter', async () => {
    const onRun = vi.fn();
    render(<CommandPalette open onClose={() => {}} onRun={onRun} />);
    const input = await screen.findByPlaceholderText('Type a command…');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRun).toHaveBeenCalled();
  });
});

describe('AIImportLane sample + clear', () => {
  it('loads the sample then clears it', async () => {
    render(<AIImportLane />);
    fireEvent.click(screen.getByText('Load sample'));
    expect(await screen.findByText('template_pack')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear'));
    await waitFor(() => expect(screen.queryByText('template_pack')).not.toBeInTheDocument());
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { RightDrawer, DrawerTab } from '../src/components/RightDrawer';
import { WorkspaceSidebar } from '../src/components/WorkspaceSidebar';
import { ProfileManagerModal } from '../src/components/ProfileManagerModal';
import { CommandPalette } from '../src/components/CommandPalette';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };

const drawerProps = (tab: DrawerTab) => ({
  open: true,
  tab,
  onTab: () => {},
  onClose: () => {},
  activeFile: null,
  activeWorkspace: ws,
  presets: [],
  onExport: async () => {},
  onUseTemplate: () => {},
  onSaveCurrentTemplate: async () => null,
  onOpenRecent: () => {},
  onInsertLibrary: () => {},
  onSaveSelectionToLibrary: () => {},
  onInsertSnippet: () => {},
  onSaveSnippet: async () => null,
  onApplyStyle: () => {},
  onSaveStyle: async () => {},
  getScene: () => ({ elements: [] }),
  onGoToFrame: () => {},
  onOpenFile: () => {},
  reviewAuthor: 'You',
  refreshKeys: { templates: 0, recents: 0, libraries: 0, stats: 0, snippets: 0, styles: 0 },
  onAiApplied: () => {},
});

beforeEach(() => installFakeApi());

describe('RightDrawer', () => {
  it('renders the tab bar and is hidden when closed', () => {
    const { container, rerender } = render(<RightDrawer {...drawerProps('properties')} />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Styles')).toBeInTheDocument();
    rerender(<RightDrawer {...drawerProps('properties')} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders each panel without crashing', async () => {
    const tabs: DrawerTab[] = ['recents', 'outline', 'templates', 'snippets', 'styles', 'libraries', 'tags', 'review', 'stats', 'git', 'plugins', 'ai'];
    for (const tab of tabs) {
      const { unmount } = render(<RightDrawer {...drawerProps(tab)} />);
      // tab label is present in the bar
      await waitFor(() => expect(screen.getAllByText(/.+/).length).toBeGreaterThan(0));
      unmount();
    }
  });
});

describe('WorkspaceSidebar search', () => {
  it('shows search results for a query', async () => {
    installFakeApi({ files: [{ name: 'roadmap.excalidraw', path: '/vault/roadmap.excalidraw', isDirectory: false, size: 1, mtime: 1, extension: '.excalidraw' }] });
    render(<WorkspaceSidebar onOpenFile={() => {}} />);
    const search = await screen.findByPlaceholderText('🔍 Search name, text, tags…');
    fireEvent.change(search, { target: { value: 'roadmap' } });
    expect(await screen.findByText(/result/)).toBeInTheDocument();
  });
});

describe('ProfileManagerModal actions', () => {
  it('creates a profile via the New action', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Side Project');
    const { api } = installFakeApi();
    render(<ProfileManagerModal isOpen onClose={() => {}} />);
    fireEvent.click(await screen.findByText('+ New profile'));
    await waitFor(() => expect(api.profiles.create).toHaveBeenCalledWith('Side Project'));
  });
});

describe('CommandPalette empty state', () => {
  it('shows a no-results message for a non-matching query', async () => {
    const { api } = installFakeApi();
    api.commands.list = vi.fn(async () => ({ commands: [{ id: 'a', title: 'Save', category: 'File', source: 'core' }] })) as any;
    render(<CommandPalette open onClose={() => {}} onRun={() => {}} />);
    const input = await screen.findByPlaceholderText('Type a command…');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(await screen.findByText('No matching commands.')).toBeInTheDocument();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { CommandPalette } from '../src/components/CommandPalette';
import { SnippetsPanel } from '../src/components/SnippetsPanel';
import { RecentsPanel } from '../src/components/RecentsPanel';
import { WelcomeScreen } from '../src/components/WelcomeScreen';
import { StatsPanel } from '../src/components/StatsPanel';
import { AIImportLane } from '../src/components/AIImportLane';
import { ShortcutsEditor } from '../src/components/ShortcutsEditor';
import { ProfileManagerModal } from '../src/components/ProfileManagerModal';

beforeEach(() => {
  installFakeApi();
});

describe('CommandPalette', () => {
  it('lists commands and filters by query, running on Enter', async () => {
    const onRun = vi.fn();
    render(<CommandPalette open onClose={() => {}} onRun={onRun} />);
    expect(await screen.findByText('Export…')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Type a command…');
    fireEvent.change(input, { target: { value: 'export' } });
    await waitFor(() => expect(screen.queryByText('New Drawing')).not.toBeInTheDocument());
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRun).toHaveBeenCalledWith('core.export');
  });

  it('renders nothing when closed', () => {
    const { container } = render(<CommandPalette open={false} onClose={() => {}} onRun={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SnippetsPanel', () => {
  it('saves a selection and lists it', async () => {
    const onSave = vi.fn(async () => ({ title: 'Box', elements: [{ id: '1' }] }));
    render(<SnippetsPanel onInsert={() => {}} onSaveSelection={onSave} />);
    fireEvent.click(screen.getByText('+ Save selection as snippet'));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(await screen.findByText('Box')).toBeInTheDocument();
  });
});

describe('RecentsPanel', () => {
  it('shows the empty state with no recents', async () => {
    render(<RecentsPanel onOpenRecent={() => {}} />);
    expect(await screen.findByText('No recent files yet.')).toBeInTheDocument();
  });
});

describe('WelcomeScreen', () => {
  it('renders hero actions and fires callbacks', () => {
    const onNew = vi.fn();
    const onCmd = vi.fn();
    render(<WelcomeScreen onNewDrawing={onNew} onOpenWorkspace={() => {}} onOpenCommands={onCmd} hasWorkspace />);
    fireEvent.click(screen.getByText('✎ New drawing'));
    expect(onNew).toHaveBeenCalled();
    fireEvent.click(screen.getByText('⌘ Command palette'));
    expect(onCmd).toHaveBeenCalled();
    // workspace already present -> "Open a folder" hidden
    expect(screen.queryByText('📁 Open a folder')).not.toBeInTheDocument();
  });
});

describe('StatsPanel', () => {
  it('renders aggregate stats for the active workspace', async () => {
    render(<StatsPanel activeWorkspace={{ id: 'w1', name: 'V', path: '/v', lastOpenedAt: 1 }} />);
    expect(await screen.findByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Elements')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // totalFiles / by-type count
  });
  it('prompts to open a workspace when none active', () => {
    render(<StatsPanel activeWorkspace={null} />);
    expect(screen.getByText('Open a workspace to see stats.')).toBeInTheDocument();
  });
});

describe('AIImportLane', () => {
  it('validates a pasted payload and enables apply', async () => {
    render(<AIImportLane />);
    const ta = screen.getByPlaceholderText(/Paste payload/);
    fireEvent.change(ta, { target: { value: '{"type":"settings_bundle","name":"x","settings":{}}' } });
    expect(await screen.findByText('Apply payload')).toBeInTheDocument();
  });
  it('shows validation errors for bad input', async () => {
    render(<AIImportLane />);
    const ta = screen.getByPlaceholderText(/Paste payload/);
    fireEvent.change(ta, { target: { value: '{ not json' } });
    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
  });
});

describe('ShortcutsEditor', () => {
  it('lists commands with their effective accelerators', async () => {
    render(<ShortcutsEditor />);
    expect(await screen.findByText('Save')).toBeInTheDocument();
    expect(screen.getAllByText('Ctrl+S').length).toBeGreaterThan(0);
  });
});

describe('ProfileManagerModal', () => {
  it('shows the active profile and is hidden when closed', async () => {
    const { rerender } = render(<ProfileManagerModal isOpen onClose={() => {}} />);
    expect(await screen.findByText('Default')).toBeInTheDocument();
    rerender(<ProfileManagerModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Default')).not.toBeInTheDocument();
  });
});

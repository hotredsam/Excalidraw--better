import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { WelcomeScreen } from '../src/components/WelcomeScreen';
import { AIImportLane } from '../src/components/AIImportLane';
import { SettingsModal } from '../src/components/SettingsModal';
import { TemplatesPanel } from '../src/components/TemplatesPanel';
import { SnippetsPanel } from '../src/components/SnippetsPanel';

beforeEach(() => installFakeApi());

describe('WelcomeScreen open-folder', () => {
  it('shows the open-folder action when no workspace and fires it', () => {
    const onOpen = vi.fn();
    render(<WelcomeScreen onNewDrawing={() => {}} onOpenWorkspace={onOpen} onOpenCommands={() => {}} hasWorkspace={false} />);
    fireEvent.click(screen.getByText('📁 Open a folder'));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('AIImportLane drag-and-drop', () => {
  it('validates a dropped file', async () => {
    render(<AIImportLane />);
    const zone = screen.getByPlaceholderText(/Paste payload/).parentElement!;
    const file = new File(['{"type":"settings_bundle","name":"x","settings":{"showGrid":true}}'], 'p.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => '{"type":"settings_bundle","name":"x","settings":{"showGrid":true}}' });
    fireEvent.drop(zone, { dataTransfer: { files: [file], getData: () => '' } });
    expect(await screen.findByText('Apply payload')).toBeInTheDocument();
  });
});

describe('SettingsModal sections', () => {
  it('renders all setting groups', async () => {
    render(<SettingsModal isOpen onClose={() => {}} />);
    expect(await screen.findByText('Editing')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('History & safety')).toBeInTheDocument();
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
  });
});

describe('TemplatesPanel save-current', () => {
  it('saves the current canvas as a template', async () => {
    const { api } = installFakeApi();
    const onSave = vi.fn(async () => ({ title: 'Kickoff', scene: { elements: [] } }));
    render(<TemplatesPanel onUseTemplate={() => {}} onSaveCurrent={onSave} />);
    fireEvent.click(screen.getByText('+ Save current canvas as template'));
    await waitFor(() => expect(api.templates.save).toHaveBeenCalled());
  });
});

describe('SnippetsPanel empty state', () => {
  it('prompts to save a selection', async () => {
    render(<SnippetsPanel onInsert={() => {}} onSaveSelection={async () => null} />);
    expect(await screen.findByText(/No snippets yet/)).toBeInTheDocument();
  });
});

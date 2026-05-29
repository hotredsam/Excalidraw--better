import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { PluginManager } from '../src/components/PluginManager';
import { ShortcutsEditor } from '../src/components/ShortcutsEditor';
import { StylePresetsPanel } from '../src/components/StylePresetsPanel';
import { LibrariesPanel } from '../src/components/LibrariesPanel';

beforeEach(() => installFakeApi());

describe('PluginManager uninstall', () => {
  it('uninstalls a non-built-in plugin after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { api } = installFakeApi({
      plugins: [{ id: 'p1', name: 'P1', version: '1', description: 'd', permissions: { filesystem: 'none', network: 'none' }, contributes: { toolbar: [], commands: [], panels: [], exportPresets: [] }, enabled: true, installedAt: 0, builtIn: false }],
    });
    render(<PluginManager />);
    fireEvent.click(await screen.findByText('Uninstall'));
    await waitFor(() => expect(api.plugins.uninstall).toHaveBeenCalledWith('p1'));
  });

  it('does not show uninstall for built-in plugins', async () => {
    installFakeApi({
      plugins: [{ id: 'b1', name: 'Built In', version: '1', description: 'd', permissions: { filesystem: 'none', network: 'none' }, contributes: { toolbar: [], commands: [], panels: [], exportPresets: [] }, enabled: true, installedAt: 0, builtIn: true }],
    });
    render(<PluginManager />);
    expect(await screen.findByText('Built In')).toBeInTheDocument();
    expect(screen.queryByText('Uninstall')).not.toBeInTheDocument();
    expect(screen.getByText('built-in')).toBeInTheDocument();
  });
});

describe('ShortcutsEditor rebind', () => {
  it('rebinds a command by capturing a key combo', async () => {
    const { api } = installFakeApi();
    render(<ShortcutsEditor />);
    const saveBtn = (await screen.findAllByText('Ctrl+S'))[0];
    fireEvent.click(saveBtn);
    fireEvent.keyDown(saveBtn, { key: 'q', ctrlKey: true });
    await waitFor(() => expect(api.shortcuts.set).toHaveBeenCalledWith('core.save', 'Ctrl+Q'));
  });
});

describe('StylePresetsPanel delete', () => {
  it('removes a preset', async () => {
    const { api, state } = installFakeApi();
    (state as any).styles = [{ id: 's1', name: 'Red', strokeColor: '#f00', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 1 }];
    render(<StylePresetsPanel onApply={() => {}} onSaveCurrent={async () => {}} />);
    fireEvent.click(await screen.findByText('✕'));
    await waitFor(() => expect(api.styles.remove).toHaveBeenCalledWith('s1'));
  });
});

describe('LibrariesPanel remove', () => {
  it('removes a library after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { api } = installFakeApi({ libraries: [{ id: 'l1', name: 'Pack', itemCount: 2, updatedAt: 1 }] });
    render(<LibrariesPanel onInsertLibrary={() => {}} onSaveSelection={() => {}} />);
    fireEvent.click(await screen.findByText('Remove'));
    await waitFor(() => expect(api.libraries.remove).toHaveBeenCalledWith('l1'));
  });
});

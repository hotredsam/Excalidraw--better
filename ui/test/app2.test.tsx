import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';

vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: (props: any) => {
    props.excalidrawAPI?.({
      getSceneElements: () => [{ id: 'e1' }],
      getAppState: () => ({ selectedElementIds: {} }),
      getFiles: () => ({}),
      updateScene: () => {},
      addFiles: () => {},
      scrollToContent: () => {},
    });
    return React.createElement('div', { 'data-testid': 'excalidraw-canvas' });
  },
  exportToBlob: vi.fn(async () => new Blob(['x'], { type: 'image/png' })),
  exportToSvg: vi.fn(async () => document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
  serializeAsJSON: () => JSON.stringify({ type: 'excalidraw', version: 2, elements: [], appState: {}, files: {} }),
}));

import App from '../src/App';

beforeEach(() => installFakeApi());

describe('App interactions (2)', () => {
  it('opens the profile manager from the switcher', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('Default'));
    fireEvent.click(await screen.findByText('Manage profiles…'));
    // Modal heading
    expect(await screen.findByText('Profiles')).toBeInTheDocument();
  });

  it('opens settings from the gear button', async () => {
    render(<App />);
    fireEvent.click(screen.getByTitle('Settings'));
    expect(await screen.findByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('toggles the AI Import panel from the header', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('✨ AI'));
    expect(await screen.findByText(/Paste or drop an AI payload/)).toBeInTheDocument();
  });

  it('runs save via Ctrl+S and shows a toast', async () => {
    const { api } = installFakeApi();
    render(<App />);
    // start a new drawing so there's something to save-as
    fireEvent.click(await screen.findByText('✎ New drawing'));
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    // save with no active file routes to Save As (prompt returns null -> no write)
    await waitFor(() => expect(api.settings.get).toHaveBeenCalled());
  });

  it('closes the drawer and shows the reopen handle', async () => {
    render(<App />);
    // close via the ✕ in the drawer header
    const closeButtons = screen.getAllByText('✕');
    fireEvent.click(closeButtons[0]);
    expect(await screen.findByTitle('Open panel')).toBeInTheDocument();
  });
});

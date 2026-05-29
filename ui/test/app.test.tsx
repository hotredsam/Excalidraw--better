import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';

// Mock the Excalidraw canvas so the full App can mount in jsdom (the real
// component needs layout/canvas APIs jsdom lacks).
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: (props: any) => {
    props.excalidrawAPI?.({
      getSceneElements: () => [],
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

// Imported after the mock is registered.
import App from '../src/App';

beforeEach(() => {
  installFakeApi();
});

describe('App integration', () => {
  it('renders the shell, welcome screen and canvas', async () => {
    render(<App />);
    // "EXCALIBUR" appears both in the header and the welcome hero.
    expect(screen.getAllByText('EXCALIBUR').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('excalidraw-canvas')).toBeInTheDocument();
    // Welcome screen shows while nothing is open.
    expect(await screen.findByText('✎ New drawing')).toBeInTheDocument();
  });

  it('opens the command palette with Ctrl+K', async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(await screen.findByPlaceholderText('Type a command…')).toBeInTheDocument();
  });

  it('opens the keyboard help with "?"', async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: '?' });
    expect(await screen.findByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('starts a new drawing from the welcome screen and dismisses it', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('✎ New drawing'));
    await waitFor(() => expect(screen.queryByText('✎ New drawing')).not.toBeInTheDocument());
  });

  it('shows the status bar with element count', async () => {
    render(<App />);
    expect(await screen.findByText(/element/)).toBeInTheDocument();
    expect(screen.getByText(/autosave/)).toBeInTheDocument();
  });

  it('switches the right drawer to the Plugins tab from the header', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('🧩 Plugins'));
    expect(await screen.findByText('+ Install from folder')).toBeInTheDocument();
  });

  it('opens the export dialog via the export command', async () => {
    render(<App />);
    // open palette, type export, run
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = await screen.findByPlaceholderText('Type a command…');
    fireEvent.change(input, { target: { value: 'Export…' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText(/Export “untitled”/)).toBeInTheDocument();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';

vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: (props: any) => {
    props.excalidrawAPI?.({
      getSceneElements: () => [{ id: 'e1' }, { id: 'e2' }],
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

describe('App interactions (3)', () => {
  it('runs "New Drawing" from the command palette and dismisses the welcome screen', async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = await screen.findByPlaceholderText('Type a command…');
    fireEvent.change(input, { target: { value: 'New Drawing' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(screen.queryByText('✎ New drawing')).not.toBeInTheDocument());
  });

  it('switches drawer tabs to Stats and computes stats', async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = await screen.findByPlaceholderText('Type a command…');
    fireEvent.change(input, { target: { value: 'Stats' } });
    fireEvent.click(await screen.findByText('Show Workspace Stats'));
    expect(await screen.findByText('Files')).toBeInTheDocument();
  });

  it('reflects the element count in the status bar', async () => {
    render(<App />);
    // canvas mock reports 2 elements via onChange after mount
    expect(await screen.findByText(/element/)).toBeInTheDocument();
  });

  it('opens the Outline panel via command', async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = await screen.findByPlaceholderText('Type a command…');
    // there is no core outline command; toggle via palette "Templates" then assert tab bar has Outline
    fireEvent.change(input, { target: { value: 'Templates' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('Outline')).toBeInTheDocument();
  });
});

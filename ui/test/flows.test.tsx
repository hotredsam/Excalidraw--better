import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { AIImportLane } from '../src/components/AIImportLane';
import { TemplatesPanel } from '../src/components/TemplatesPanel';
import { SnippetsPanel } from '../src/components/SnippetsPanel';
import { ReviewPanel } from '../src/components/ReviewPanel';

const ws = { id: 'w1', name: 'Vault', path: '/vault', lastOpenedAt: 1 };
const file = { name: 'a.excalidraw', path: '/vault/a.excalidraw', isDirectory: false, size: 1, mtime: 1, extension: '.excalidraw' };

beforeEach(() => installFakeApi());

describe('AIImportLane apply flow', () => {
  it('applies a validated payload and calls onApplied', async () => {
    const { api } = installFakeApi();
    const onApplied = vi.fn();
    render(<AIImportLane onApplied={onApplied} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste payload/), {
      target: { value: '{"type":"template_pack","name":"x","templates":[{"id":"a","title":"A"}]}' },
    });
    fireEvent.click(await screen.findByText('Apply payload'));
    await waitFor(() => expect(api.ai.apply).toHaveBeenCalled());
    expect(onApplied).toHaveBeenCalled();
  });
});

describe('TemplatesPanel use + save', () => {
  it('lists a template and inserts it', async () => {
    const { state } = installFakeApi();
    state.templates['t1'] = { id: 't1', title: 'Flowchart', description: 'start', tags: ['diagram'], scene: { elements: [] } };
    const onUse = vi.fn();
    render(<TemplatesPanel onUseTemplate={onUse} onSaveCurrent={async () => null} />);
    expect(await screen.findByText('Flowchart')).toBeInTheDocument();
    fireEvent.click(screen.getByText('New from this'));
    await waitFor(() => expect(onUse).toHaveBeenCalled());
  });
});

describe('SnippetsPanel insert', () => {
  it('inserts a saved snippet', async () => {
    const { state } = installFakeApi();
    state.snippets['s1'] = { id: 's1', title: 'Box', description: '', tags: [], elements: [{ id: '1' }], createdAt: 1 };
    const onInsert = vi.fn();
    render(<SnippetsPanel onInsert={onInsert} onSaveSelection={async () => null} />);
    expect(await screen.findByText('Box')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Insert'));
    expect(onInsert).toHaveBeenCalledWith('s1');
  });
});

describe('ReviewPanel resolve flow', () => {
  it('resolves a pin', async () => {
    const { api } = installFakeApi();
    api.review.get = vi.fn(async () => ({
      pins: [{ id: 'p1', x: 0, y: 0, resolved: false, comments: [{ id: 'c1', author: 'You', body: 'fix', createdAt: 1 }] }],
    })) as any;
    api.review.setResolved = vi.fn(async () => ({ pins: [] })) as any;
    render(<ReviewPanel activeWorkspace={ws} activeFile={file} author="You" />);
    expect(await screen.findByText('fix')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Resolve'));
    await waitFor(() => expect(api.review.setResolved).toHaveBeenCalled());
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { installFakeApi } from './fakeApi';
import { StylePresetsPanel } from '../src/components/StylePresetsPanel';

beforeEach(() => installFakeApi());

describe('StylePresetsPanel', () => {
  it('shows the empty state and a save action', async () => {
    render(<StylePresetsPanel onApply={() => {}} onSaveCurrent={async () => {}} />);
    expect(await screen.findByText(/No style presets yet/)).toBeInTheDocument();
    expect(screen.getByText('+ Save current style')).toBeInTheDocument();
  });

  it('lists presets and applies one', async () => {
    const { state } = installFakeApi();
    (state as any).styles = [
      { id: 's1', name: 'Red', strokeColor: '#ff0000', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 0 },
    ];
    const onApply = vi.fn();
    render(<StylePresetsPanel onApply={onApply} onSaveCurrent={async () => {}} />);
    expect(await screen.findByText('Red')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ name: 'Red' }));
  });

  it('invokes save-current then refreshes', async () => {
    const onSave = vi.fn(async () => {});
    render(<StylePresetsPanel onApply={() => {}} onSaveCurrent={onSave} />);
    fireEvent.click(screen.getByText('+ Save current style'));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });
});

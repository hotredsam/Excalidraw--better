import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { ToastHost } from '../src/components/ToastHost';
import { notify, toastError, toastSuccess, subscribeToasts } from '../src/lib/toast';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('toast system', () => {
  it('notifies subscribers and auto-dismisses after ttl', () => {
    const seen: number[] = [];
    const unsub = subscribeToasts((t) => seen.push(t.length));
    act(() => notify('hello', 'info', 1000));
    expect(seen[seen.length - 1]).toBe(1);
    act(() => vi.advanceTimersByTime(1100));
    expect(seen[seen.length - 1]).toBe(0);
    unsub();
  });

  it('renders toast messages in the host', () => {
    render(<ToastHost />);
    act(() => toastSuccess('Saved!'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    act(() => toastError('Boom'));
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });
});

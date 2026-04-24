import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBlockUser, useUnblockUser } from '../useBlockUser';
import * as api from '../../api/messagingApi';

vi.mock('../../api/messagingApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBlockUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block a user successfully', async () => {
    vi.mocked(api.blockUser).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBlockUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('user-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.blockUser).toHaveBeenCalledWith('user-1');
  });

  it('should handle block failure', async () => {
    vi.mocked(api.blockUser).mockRejectedValueOnce(new Error('Block failed'));

    const { result } = renderHook(() => useBlockUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('user-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Block failed');
  });
});

describe('useUnblockUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unblock a user successfully', async () => {
    vi.mocked(api.unblockUser).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUnblockUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('user-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.unblockUser).toHaveBeenCalledWith('user-1');
  });
});

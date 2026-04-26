import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteConversation } from '../useDeleteConversation';
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

describe('useDeleteConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a conversation successfully', async () => {
    vi.mocked(api.deleteConversation).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteConversation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('conv-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.deleteConversation).toHaveBeenCalledWith('conv-1');
  });

  it('should handle delete failure', async () => {
    vi.mocked(api.deleteConversation).mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useDeleteConversation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('conv-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Delete failed');
  });
});

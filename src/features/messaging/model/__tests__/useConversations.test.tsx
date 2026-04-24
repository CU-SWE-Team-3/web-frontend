import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversations } from '../useConversations';
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

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch conversations successfully', async () => {
    const mockConversations = [
      {
        _id: 'conv-1',
        participants: [{ _id: 'u1', displayName: 'User 1', permalink: 'user1', avatarUrl: null }],
        participant: { _id: 'u1', displayName: 'User 1', permalink: 'user1', avatarUrl: null },
        lastMessage: null,
        unreadCount: 0,
        isBlocked: false,
        isBlockedBy: false,
        isFirstMessage: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    vi.mocked(api.getConversations).mockResolvedValueOnce(mockConversations);

    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockConversations);
    expect(api.getConversations).toHaveBeenCalledOnce();
  });

  it('should handle error state', async () => {
    vi.mocked(api.getConversations).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should start in loading state', () => {
    vi.mocked(api.getConversations).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

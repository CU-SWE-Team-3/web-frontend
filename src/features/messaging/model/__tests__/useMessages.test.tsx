import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages } from '../useMessages';
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

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch messages for a conversation', async () => {
    const mockMessages = [
      {
        _id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'u1',
        sender: { _id: 'u1', displayName: 'User 1', permalink: 'user1', avatarUrl: null },
        content: 'Hello!',
        attachment: null,
        sharedTrack: null,
        status: 'sent' as const,
        isEdited: false,
        isDeleted: false,
        deletedFor: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        readAt: null,
      },
    ];

    vi.mocked(api.getMessages).mockResolvedValueOnce(mockMessages);

    const { result } = renderHook(() => useMessages('conv-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMessages);
    expect(api.getMessages).toHaveBeenCalledWith('conv-1');
  });

  it('should not fetch when conversationId is null', () => {
    const { result } = renderHook(() => useMessages(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(api.getMessages).not.toHaveBeenCalled();
  });

  it('should handle error state', async () => {
    vi.mocked(api.getMessages).mockRejectedValueOnce(new Error('Failed to load'));

    const { result } = renderHook(() => useMessages('conv-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Failed to load');
  });
});

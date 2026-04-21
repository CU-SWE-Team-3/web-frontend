import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStartConversation } from '../useStartConversation';
import * as api from '../../api/messagingApi';
import type { Conversation } from '../types';

vi.mock('../../api/messagingApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockConversation: Conversation = {
  _id: 'conv-new',
  participants: [
    { _id: 'u1', displayName: 'User 1', permalink: 'user1', avatarUrl: null },
  ],
  participant: { _id: 'u1', displayName: 'User 1', permalink: 'user1', avatarUrl: null },
  lastMessage: null,
  unreadCount: 0,
  isBlocked: false,
  isBlockedBy: false,
  isFirstMessage: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useStartConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start a new conversation successfully', async () => {
    vi.mocked(api.startConversation).mockResolvedValueOnce(mockConversation);

    const { result } = renderHook(() => useStartConversation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        userId: 'u1',
        content: 'Hello!',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.startConversation).toHaveBeenCalledWith('u1', 'Hello!', undefined);
    expect(result.current.data?._id).toBe('conv-new');
  });

  it('should start a conversation with a shared track', async () => {
    vi.mocked(api.startConversation).mockResolvedValueOnce(mockConversation);

    const sharedTrack = {
      trackId: 'track-1',
      title: 'Test Track',
      artist: 'Test Artist',
      artworkUrl: null,
      duration: 180,
      trackUrl: '/track/test',
    };

    const { result } = renderHook(() => useStartConversation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        userId: 'u1',
        content: 'Check this out!',
        sharedTrack,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.startConversation).toHaveBeenCalledWith('u1', 'Check this out!', sharedTrack);
  });

  it('should handle failure when starting a conversation', async () => {
    vi.mocked(api.startConversation).mockRejectedValueOnce(new Error('User not found'));

    const { result } = renderHook(() => useStartConversation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        userId: 'invalid-user',
        content: 'Hello!',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('User not found');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSendMessage } from '../useSendMessage';
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

describe('useSendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a message successfully', async () => {
    const mockResponse = {
      _id: 'msg-new',
      conversationId: 'conv-1',
      senderId: 'dev-mock-user',
      sender: { _id: 'dev-mock-user', displayName: 'Local Dev', permalink: 'local-dev', avatarUrl: null },
      content: 'Test message',
      attachment: null,
      sharedTrack: null,
      status: 'sent' as const,
      isEdited: false,
      isDeleted: false,
      deletedFor: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      readAt: null,
    };

    vi.mocked(api.sendMessage).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        conversationId: 'conv-1',
        content: 'Test message',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.sendMessage).toHaveBeenCalledWith('conv-1', 'Test message', undefined);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle send failure', async () => {
    vi.mocked(api.sendMessage).mockRejectedValueOnce(new Error('Send failed'));

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        conversationId: 'conv-1',
        content: 'Test message',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Send failed');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUnreadCount } from '../useUnreadCount';
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

describe('useUnreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch unread count', async () => {
    vi.mocked(api.getUnreadCount).mockResolvedValueOnce(5);

    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(5);
    expect(api.getUnreadCount).toHaveBeenCalledOnce();
  });

  it('should return 0 when no unread messages', async () => {
    vi.mocked(api.getUnreadCount).mockResolvedValueOnce(0);

    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(0);
  });

  it('should handle error state', async () => {
    vi.mocked(api.getUnreadCount).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });
});

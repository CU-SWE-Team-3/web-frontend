import { renderHook, waitFor } from '@testing-library/react';
import { useUserReposts } from '../useUserReposts';
import { getUserReposts } from '../../api/engagementApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

vi.mock('../../api/engagementApi', () => ({
  getUserReposts: vi.fn(),
}));

describe('useUserReposts', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch user reposts when userId is provided', async () => {
    const mockReposts = [
      { track: { _id: 'track-1', title: 'Test 1' } },
      { track: { _id: 'track-2', title: 'Test 2' } },
    ];
    vi.mocked(getUserReposts).mockResolvedValueOnce(mockReposts as any);

    const { result } = renderHook(() => useUserReposts('user-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getUserReposts).toHaveBeenCalledWith('user-123');
    expect(result.current.data).toEqual(mockReposts);
  });

  it('should not fetch when userId is empty', () => {
    renderHook(() => useUserReposts(''), { wrapper });
    expect(getUserReposts).not.toHaveBeenCalled();
  });
});

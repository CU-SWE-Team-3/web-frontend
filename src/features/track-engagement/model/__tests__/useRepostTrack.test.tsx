import { renderHook, act } from '@testing-library/react';
import { useRepostTrack } from '../useRepostTrack';
import { repostTrack } from '../../api/engagementApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { USER_REPOSTS_QUERY_KEY } from '../useUserReposts';
import React from 'react';

vi.mock('../../api/engagementApi', () => ({
  repostTrack: vi.fn(),
}));

describe('useRepostTrack', () => {
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

  it('should call repostTrack and invalidate queries on success', async () => {
    vi.mocked(repostTrack).mockResolvedValueOnce({ reposted: true });
    
    // Spy on invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRepostTrack(), { wrapper });

    await act(async () => {
      result.current.mutate({ trackId: 'track-123' });
    });

    expect(repostTrack).toHaveBeenCalledWith('track-123');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_REPOSTS_QUERY_KEY });
  });
});

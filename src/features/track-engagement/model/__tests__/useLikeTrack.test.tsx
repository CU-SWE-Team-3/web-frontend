import { renderHook, act } from '@testing-library/react';
import { useLikeTrack } from '../useLikeTrack';
import { likeTrack } from '../../api/engagementApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LIKED_TRACKS_QUERY_KEY } from '../useLikedTracks';
import React from 'react';

vi.mock('../../api/engagementApi', () => ({
  likeTrack: vi.fn(),
}));

describe('useLikeTrack', () => {
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

  it('should call likeTrack and invalidate queries on success', async () => {
    vi.mocked(likeTrack).mockResolvedValueOnce(undefined);
    
    // Spy on invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useLikeTrack(), { wrapper });

    await act(async () => {
      result.current.mutate('track-123');
    });

    expect(likeTrack).toHaveBeenCalledWith('track-123');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: LIKED_TRACKS_QUERY_KEY, refetchType: 'all' });
  });
});

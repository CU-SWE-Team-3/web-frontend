import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLikedStations, useCheckStationLiked, useLikeStation, useUnlikeStation } from '../stationQueries';
import { stationsRepository } from '../../api/stationsRepository';

vi.mock('../../api/stationsRepository', () => ({
  stationsRepository: {
    getLikedStations: vi.fn(),
    checkStationLiked: vi.fn(),
    likeStation: vi.fn(),
    unlikeStation: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('stationQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLikedStations', () => {
    it('fetches liked stations', async () => {
      const mockStations = [{ stationId: 's1' }];
      vi.mocked(stationsRepository.getLikedStations).mockResolvedValueOnce(mockStations as any);

      const { result } = renderHook(() => useLikedStations(true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(stationsRepository.getLikedStations).toHaveBeenCalledWith(true);
      expect(result.current.data).toEqual(mockStations);
    });
  });

  describe('useCheckStationLiked', () => {
    it('checks if a station is liked', async () => {
      vi.mocked(stationsRepository.checkStationLiked).mockResolvedValueOnce({ liked: true });

      const { result } = renderHook(() => useCheckStationLiked('s1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(stationsRepository.checkStationLiked).toHaveBeenCalledWith('s1');
      expect(result.current.data).toEqual({ liked: true });
    });
  });

  describe('useLikeStation', () => {
    it('calls repository likeStation', async () => {
      vi.mocked(stationsRepository.likeStation).mockResolvedValueOnce({ liked: true, stationId: 's1' });

      const { result } = renderHook(() => useLikeStation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ stationId: 's1', payload: { stationType: 'genre' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(stationsRepository.likeStation).toHaveBeenCalledWith('s1', { stationType: 'genre' });
    });
  });

  describe('useUnlikeStation', () => {
    it('calls repository unlikeStation', async () => {
      vi.mocked(stationsRepository.unlikeStation).mockResolvedValueOnce({ liked: false, stationId: 's1' });

      const { result } = renderHook(() => useUnlikeStation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('s1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(stationsRepository.unlikeStation).toHaveBeenCalledWith('s1');
    });
  });
});

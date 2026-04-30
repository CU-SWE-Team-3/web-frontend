import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stationsRepository, type LikeStationRequest, type HydratedStation } from '../api/stationsRepository';
import { LIKED_ITEMS_QUERY_KEY } from '@/features/track-engagement/model/useLikedTracks';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const LIKED_STATIONS_QUERY_KEY = ['liked-stations'] as const;
export const STATION_LIKED_CHECK_KEY = (stationId: string) => ['station-liked-check', stationId] as const;

// ─── useLikedStations ─────────────────────────────────────────────────────────

/**
 * Fetch all stations the current user has liked.
 */
export function useLikedStations(hydrate = true) {
  return useQuery<HydratedStation[], Error>({
    queryKey: [...LIKED_STATIONS_QUERY_KEY, hydrate],
    queryFn: () => stationsRepository.getLikedStations(hydrate),
    staleTime: 0,
    refetchOnMount: 'always' as const,
  });
}

// ─── useCheckStationLiked ─────────────────────────────────────────────────────

/**
 * Lightweight check: is a specific station liked by the current user?
 */
export function useCheckStationLiked(stationId: string) {
  return useQuery<{ liked: boolean }, Error>({
    queryKey: STATION_LIKED_CHECK_KEY(stationId),
    queryFn: () => stationsRepository.checkStationLiked(stationId),
    enabled: !!stationId,
    staleTime: 0,
    refetchOnMount: 'always' as const,
  });
}

// ─── useLikeStation ───────────────────────────────────────────────────────────

/**
 * Mutation: like a station.
 * Optimistically updates the check-liked query and invalidates liked-stations.
 */
export function useLikeStation() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof stationsRepository.likeStation>>,
    Error,
    { stationId: string; payload: LikeStationRequest },
    { prev: unknown; stationId: string }
  >({
    mutationFn: ({ stationId, payload }) => stationsRepository.likeStation(stationId, payload),
    onMutate: async ({ stationId }) => {
      // Optimistic: mark as liked immediately
      await queryClient.cancelQueries({ queryKey: STATION_LIKED_CHECK_KEY(stationId) });
      const prev = queryClient.getQueryData(STATION_LIKED_CHECK_KEY(stationId));
      queryClient.setQueryData(STATION_LIKED_CHECK_KEY(stationId), { liked: true });
      return { prev, stationId };
    },
    onError: (_err, { stationId }, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(STATION_LIKED_CHECK_KEY(stationId), context.prev);
      }
    },
    onSettled: (_data, _err, { stationId }) => {
      queryClient.invalidateQueries({ queryKey: STATION_LIKED_CHECK_KEY(stationId) });
      queryClient.invalidateQueries({ queryKey: LIKED_STATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LIKED_ITEMS_QUERY_KEY });
    },
  });
}

// ─── useUnlikeStation ─────────────────────────────────────────────────────────

/**
 * Mutation: unlike a station.
 * Optimistically updates the check-liked query and invalidates liked-stations.
 */
export function useUnlikeStation() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof stationsRepository.unlikeStation>>,
    Error,
    string,
    { prev: unknown; stationId: string }
  >({
    mutationFn: (stationId: string) => stationsRepository.unlikeStation(stationId),
    onMutate: async (stationId) => {
      await queryClient.cancelQueries({ queryKey: STATION_LIKED_CHECK_KEY(stationId) });
      const prev = queryClient.getQueryData(STATION_LIKED_CHECK_KEY(stationId));
      queryClient.setQueryData(STATION_LIKED_CHECK_KEY(stationId), { liked: false });
      return { prev, stationId };
    },
    onError: (_err, stationId, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(STATION_LIKED_CHECK_KEY(stationId), context.prev);
      }
    },
    onSettled: (_data, _err, stationId) => {
      queryClient.invalidateQueries({ queryKey: STATION_LIKED_CHECK_KEY(stationId) });
      queryClient.invalidateQueries({ queryKey: LIKED_STATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LIKED_ITEMS_QUERY_KEY });
    },
  });
}

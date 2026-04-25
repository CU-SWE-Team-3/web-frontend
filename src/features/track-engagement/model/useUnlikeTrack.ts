import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlikeTrack } from "../api/engagementApi";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useUnlikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => unlikeTrack(trackId),
    onMutate: async (trackId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });

      // Snapshot all current queries for this key prefix
      const queries = queryClient.getQueriesData({ queryKey: LIKED_TRACKS_QUERY_KEY });

      // Optimistically remove the track from ALL cached liked-track lists
      queries.forEach(([queryKey, oldData]) => {
        if (Array.isArray(oldData)) {
          queryClient.setQueryData(queryKey, oldData.filter((t: any) => t.id !== trackId && t._id !== trackId));
        }
      });

      return { queries };
    },
    onError: (err, trackId, context) => {
      console.error(`[useUnlikeTrack] Failed to unlike track ${trackId}:`, err);
      // Roll back the optimistic update for all queries
      context?.queries?.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });
    },
    onSettled: () => {
      // Always refetch to get the real server state
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY, refetchType: 'all' });
    },
  });
};

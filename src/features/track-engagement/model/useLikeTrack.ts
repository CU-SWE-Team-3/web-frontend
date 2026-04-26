import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeTrack } from "../api/engagementApi";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useLikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => likeTrack(trackId),
    onMutate: async (trackId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });

      // Snapshot the previous value
      const previousLikes = queryClient.getQueryData([...LIKED_TRACKS_QUERY_KEY, "me"]);

      // Optimistically update to the new value
      // Note: We don't have the full track object here, so we just invalidate on settle
      // but we can at least ensure researchers know it's pending.
      
      return { previousLikes };
    },
    onError: (err, trackId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData([...LIKED_TRACKS_QUERY_KEY, "me"], context.previousLikes);
      }
    },
    onSettled: () => {
      // Always refetch to get the real server state
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY, refetchType: 'all' });
    },
  });
};

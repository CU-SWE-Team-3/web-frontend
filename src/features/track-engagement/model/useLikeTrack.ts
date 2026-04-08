import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeTrack } from "../api/engagementApi";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useLikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => likeTrack(trackId),
    onMutate: async (trackId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });

      // Snapshot the previous value for rollback
      const previousLikes = queryClient.getQueryData([...LIKED_TRACKS_QUERY_KEY, 'me']);

      // Optimistically add a minimal track node to the cache so UI reacts instantly
      queryClient.setQueryData([...LIKED_TRACKS_QUERY_KEY, 'me'], (old: any) => {
        const arr = Array.isArray(old) ? old : [];
        if (arr.find((t: any) => t.id === trackId || t._id === trackId)) return old;
        return [{ id: trackId, _id: trackId, title: "Loading...", artist: "", isLiked: true }, ...arr];
      });

      return { previousLikes };
    },
    onError: (err, trackId, context) => {
      console.error(`[useLikeTrack] Failed to like track ${trackId}:`, err);
      // Roll back the optimistic update
      if (context?.previousLikes) {
        queryClient.setQueryData([...LIKED_TRACKS_QUERY_KEY, 'me'], context.previousLikes);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to get the real server state
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY, refetchType: 'all' });
    },
  });
};

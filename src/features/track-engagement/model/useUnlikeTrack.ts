import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlikeTrack } from "../api/engagementApi";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useUnlikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => unlikeTrack(trackId),
    onMutate: async (trackId) => {
      await queryClient.cancelQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });
      const previousLikes = queryClient.getQueryData([...LIKED_TRACKS_QUERY_KEY, 'me']);
      
      // Optimistically remove the track from the cache
      queryClient.setQueryData([...LIKED_TRACKS_QUERY_KEY, 'me'], (old: any) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.filter((t: any) => t.id !== trackId && t._id !== trackId);
      });

      return { previousLikes };
    },
    onError: (_err, _newUnlike, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData([...LIKED_TRACKS_QUERY_KEY, 'me'], context.previousLikes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });
    },
  });
};

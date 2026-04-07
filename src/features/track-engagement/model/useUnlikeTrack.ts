import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlikeTrack } from "../api/engagementApi";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useUnlikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => unlikeTrack(trackId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });
    },
  });
};

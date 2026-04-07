import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeTrack } from "../api/engagementApi";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useLikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => likeTrack(trackId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });
    },
  });
};

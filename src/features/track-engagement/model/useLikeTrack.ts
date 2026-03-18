import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LIKED_TRACKS_QUERY_KEY } from "./useLikedTracks";

export const useLikeTrack = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (trackId: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/tracks/${trackId}/like`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIKED_TRACKS_QUERY_KEY });
    },
  });
};

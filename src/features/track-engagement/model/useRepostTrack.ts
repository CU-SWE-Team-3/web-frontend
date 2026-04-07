import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repostTrack } from "../api/engagementApi";
import { USER_REPOSTS_QUERY_KEY } from "./useUserReposts";

export const useRepostTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => repostTrack(trackId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_REPOSTS_QUERY_KEY });
    },
  });
};

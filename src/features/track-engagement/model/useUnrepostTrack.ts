import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unrepostTrack } from "../api/engagementApi";
import { USER_REPOSTS_QUERY_KEY } from "./useUserReposts";

export const useUnrepostTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string) => {
      await unrepostTrack(trackId);
      return trackId;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_REPOSTS_QUERY_KEY });
    },
  });
};

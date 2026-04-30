import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unrepostTrack } from "../api/engagementApi";
import { USER_REPOSTS_QUERY_KEY } from "./useUserReposts";
import { FEED_QUERY_KEY } from "@/features/feed/model/feedQueries";
import type { FeedActivity } from "@/features/feed/model/types";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

export const useUnrepostTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string) => {
      await unrepostTrack(trackId);
      return trackId;
    },
    onSuccess: (trackId) => {
      const user = useAuthStore.getState().user;
      const userId = user?._id || user?.id;

      queryClient.setQueryData<FeedActivity[]>(FEED_QUERY_KEY, (current = []) =>
        current.filter((activity) => {
          const isSameTrack = activity.target?._id === trackId || activity.target?.permalink === trackId;
          if (activity.activityType !== "REPOST" || !isSameTrack) return true;
          if (!userId) return false;
          return !activity.actors.some((actor) => actor._id === userId);
        }),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_REPOSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
};

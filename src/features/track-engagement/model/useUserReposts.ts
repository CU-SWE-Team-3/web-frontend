import { useQuery } from "@tanstack/react-query";
import { getUserReposts } from "../api/engagementApi";
import type { Track } from "@/features/tracks/model/track";

export const USER_REPOSTS_QUERY_KEY = ["user-reposts"] as const;

/**
 * Shape of each item in the repostedTracks array from
 * GET /profile/{userId}/reposts (YAML spec)
 */
export interface RepostedTrack {
  repostDate: string;
  targetModel?: string;
  target?: Track;
  track: Track;
}

export const useUserReposts = (userId: string) => {
  return useQuery<RepostedTrack[], Error>({
    queryKey: [...USER_REPOSTS_QUERY_KEY, userId],
    queryFn: async () => {
      return await getUserReposts(userId);
    },
    enabled: Boolean(userId),
  });
};

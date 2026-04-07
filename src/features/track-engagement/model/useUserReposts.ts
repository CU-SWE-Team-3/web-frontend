import { useQuery } from "@tanstack/react-query";
import { getUserReposts } from "../api/engagementApi";

export const USER_REPOSTS_QUERY_KEY = ["user-reposts"] as const;

/**
 * Shape of each item in the repostedTracks array from
 * GET /profile/{userId}/reposts (YAML spec)
 */
export interface RepostedTrack {
  repostDate: string;
  track: {
    _id: string;
    id?: string;
    title: string;
    artist: {
      _id: string;
      displayName: string;
      permalink: string;
      avatarUrl: string;
    };
    audioUrl?: string;
    artworkUrl?: string;
    duration: number;
    playCount: number;
    likeCount: number;
    repostCount: number;
    createdAt: string;
  };
}

export const useUserReposts = (userId: string) => {
  return useQuery<RepostedTrack[], Error>({
    queryKey: [...USER_REPOSTS_QUERY_KEY, userId],
    queryFn: () => getUserReposts(userId),
    enabled: Boolean(userId),
  });
};

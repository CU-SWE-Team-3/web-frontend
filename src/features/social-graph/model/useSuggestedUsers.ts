import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { FollowNode } from "./types";

/**
 * GET /network/suggested
 * v1.10 envelope: { success, count, data: ArtistSummary[] }
 * ArtistSummary: { _id, displayName, permalink, avatarUrl, isPremium }
 * Requires authentication.
 */
export const useSuggestedUsers = () => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "suggested"],
    queryFn: async () => {
      const { data } = await apiClient.get("/network/suggested", {
        withCredentials: true,
      });

      // v1.10 envelope: { success, count, data: ArtistSummary[] }
      const list: any[] = data.data ?? data;

      return list.map((u: any) => ({
        id: u._id || u.id,
        username: u.permalink || u.username || "",
        displayName: u.displayName || "",
        avatarUrl: u.avatarUrl || null,
        followerCount: u.followerCount ?? u.followersCount ?? 0,
        isFollowing: u.isFollowing ?? false,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

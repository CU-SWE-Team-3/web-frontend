import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { FollowNode } from "./types";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

/**
 * GET /network/{userId}/following
 * v1.10 envelope: { success, count, data: ArtistSummary[] }
 * ArtistSummary: { _id, displayName, permalink, avatarUrl, isPremium }
 * No authentication required.
 */
export const useFollowing = (userId: string) => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "following", userId],
    queryFn: async () => {
      let targetId = userId;
      const currentUser = useAuthStore.getState().user;
      const currentUserIds = new Set(
        [
          currentUser?.id,
          (currentUser as any)?._id,
          currentUser?.username,
          currentUser?.permalink,
        ].filter(Boolean),
      );

      // Resolve permalink to _id if it's not a standard Mongo ObjectId
      if (userId.length !== 24) {
        try {
          const profRes = await apiClient.get(`/profile/${userId}`, { withCredentials: true });
          targetId = profRes.data.data?.user?._id || profRes.data.data?._id || userId;
        } catch (err) {
          console.warn('Could not resolve permalink to ID', err);
        }
      }

      const { data } = await apiClient.get(`/network/${targetId}/following`, {
        withCredentials: true,
      });

      // v1.10 envelope: { success, count, data: ArtistSummary[] }
      const raw: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.following)
          ? data.data.following
          : Array.isArray(data?.following)
            ? data.following
            : Array.isArray(data)
              ? data
              : [];

      const isViewingOwnFollowing = currentUserIds.has(userId) || currentUserIds.has(targetId);

      return raw.map((u: any) => ({
        id: u._id || u.id,
        username: u.permalink || u.username || "",
        displayName: u.displayName || u.username || u.permalink || "",
        avatarUrl: u.avatarUrl || null,
        followerCount: u.followerCount ?? u.followersCount ?? u.followers_count ?? 0,
        followingCount: u.followingCount ?? 0,
        isFollowing: u.isFollowing ?? isViewingOwnFollowing,
      }));
    },
    enabled: !!userId,
    staleTime: 0,
  });
};

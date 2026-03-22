import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { FollowNode } from "./types";

export const useFollowers = (userId: string) => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "followers", userId],
    queryFn: async () => {
      let targetId = userId;
      
      // Resolve permalink to _id if it's not a standard Mongo ObjectId
      if (userId.length !== 24) {
        try {
          const profRes = await apiClient.get(`/profile/${userId}`, { withCredentials: true });
          targetId = profRes.data.data?.user?._id || profRes.data.data?._id || userId;
        } catch (err) {
          console.warn('Could not resolve permalink to ID', err);
        }
      }

      const { data } = await apiClient.get(`/network/${targetId}/followers`, {
        withCredentials: true,
      });
      const raw: any[] = data.data ?? data;
      return raw.map((u: any) => ({
        id: u._id || u.id,
        username: u.permalink || u.username || '',
        displayName: u.displayName || '',
        avatarUrl: u.avatarUrl || null,
        followerCount: u.followerCount ?? 0,
        isFollowing: u.isFollowing ?? false,
      }));
    },
    enabled: !!userId,
    staleTime: 0,
  });
};

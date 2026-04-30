import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { BlockedUser } from "./types";

export const BLOCKED_USERS_QUERY_KEY = ["blocked-users"] as const;

/**
 * GET /network/blocked-users
 * v1.10 envelope: { success, count, data: ArtistSummary[] }
 * ArtistSummary: { _id, displayName, permalink, avatarUrl, isPremium }
 */
export const useBlockedUsers = () => {
  return useQuery<BlockedUser[], Error>({
    queryKey: BLOCKED_USERS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get("/network/blocked-users", {
        withCredentials: true,
      });

      // v1.10 envelope: { success, count, data: ArtistSummary[] }
      const list: any[] = data.data ?? [];

      return list.map((user) => ({
        id: user._id || user.id,
        username: user.permalink || user.username || "",
        displayName: user.displayName || "",
        avatarUrl: user.avatarUrl || null,
      }));
    },
  });
};

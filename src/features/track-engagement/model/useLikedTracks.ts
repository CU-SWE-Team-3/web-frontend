import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { TrackNode } from "./types";

export const LIKED_TRACKS_QUERY_KEY = ["liked-tracks"] as const;

/**
 * Map raw API liked-track response to our TrackNode interface.
 * The backend may return `_id`, nested `artist` objects, etc.
 */
function mapLikedTrack(rawItem: any): TrackNode {
  // Backends often return likes as an array of { track: { ... }, likedAt: "..." }
  // or it might just be the track directly. This handles both.
  const t = rawItem.track || rawItem;

  return {
    id: t._id || t.id,
    title: t.title || t.name || "Untitled",
    artist:
      t.artist?.displayName ||
      t.artist?.username ||
      t.artist?.name ||
      t.artist?.permalink ||
      (typeof t.artist === "string" ? t.artist : "") ||
      "Unknown Artist",
    artworkUrl: t.artworkUrl || t.coverUrl || t.imageUrl || null,
    createdAt: t.createdAt || t.likedAt || "",
    durationFormatted:
      typeof t.duration === "number"
        ? `${Math.floor(t.duration / 60)}:${Math.floor(t.duration % 60)
            .toString()
            .padStart(2, "0")}`
        : t.duration || t.durationFormatted || "0:00",
    playCount: t.playCount ?? 0,
    likeCount: t.likeCount ?? 0,
    repostCount: t.repostCount ?? 0,
    commentCount: t.commentCount ?? 0,
    isLiked: true, // If it's in the liked list, it's liked
    isReposted: t.isReposted ?? false,
    // Pass through streaming URLs so the Library/Likes pages can play them
    ...(t.streamUrl && { streamUrl: t.streamUrl }),
    ...(t.hlsUrl && { hlsUrl: t.hlsUrl }),
  };
}

/**
 * Fetch the user's liked track list.
 * The backend endpoint is: GET /profile/{userId}/likes
 *
 * FIXES APPLIED:
 * 1. Auth hydration guard — waits for isInitialized before fetching
 * 2. No more swallowing errors — let React Query handle retries/error state
 * 3. staleTime: 0 — always refetch fresh data so likes stay in sync
 * 4. Proper field mapping — normalizes _id, nested artist objects, etc.
 */
export const useLikedTracks = (userId: string = "me") => {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  // If "me" is passed, use the real user ID to prevent 400 Bad Requests
  const actualUserId = userId === "me" ? (user?.id || (user as any)?._id || "me") : userId;

  return useQuery<TrackNode[], Error>({
    queryKey: [...LIKED_TRACKS_QUERY_KEY, actualUserId],
    queryFn: async (): Promise<TrackNode[]> => {
      const { data } = await apiClient.get(`/profile/${actualUserId}/likes`, {
        withCredentials: true,
      });

      // Parse the API response envelope — try all known shapes
      const rawTracks =
        data?.data?.likes ||
        data?.data?.likedTracks ||
        data?.data ||
        data?.likes ||
        data ||
        [];

      if (!Array.isArray(rawTracks)) {
        console.warn(
          "[useLikedTracks] API response is not an array, got:",
          typeof rawTracks,
          rawTracks
        );
        return [];
      }

      return rawTracks.map(mapLikedTrack);
    },
    enabled: isInitialized,
    staleTime: 0,
    refetchOnMount: "always" as const,
  });
};

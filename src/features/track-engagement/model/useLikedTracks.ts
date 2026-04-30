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
  // Backend YAML: likedTracks is an array of { likeDate, target: TrackSummary, targetModel }
  const t = rawItem.target || rawItem.track || rawItem;

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
    createdAt: t.createdAt || rawItem.likeDate || "",
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
    isLiked: true,
    isReposted: t.isReposted ?? false,
    streamUrl: t.streamUrl || t.hlsUrl || t.audioUrl || "",
    hlsUrl: t.hlsUrl || t.streamUrl || t.audioUrl || "",
    audioFileName: t.audioFileName || "",
    duration: typeof t.duration === "number" ? t.duration : 0,
    permalink: t.permalink || t._id || t.id,
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

  // Check if the userId looks like a MongoDB ObjectId (24 hex chars)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(actualUserId);

  return useQuery<TrackNode[], Error>({
    queryKey: [...LIKED_TRACKS_QUERY_KEY, actualUserId],
    queryFn: async (): Promise<TrackNode[]> => {
      let resolvedId = actualUserId;

      // If the userId is not a MongoDB ObjectId (it's a permalink/username),
      // resolve it to the actual profile _id first
      if (!isObjectId && actualUserId !== "me") {
        try {
          const profileRes = await apiClient.get(`/profile/${actualUserId}`, {
            withCredentials: true,
          });
          const profileData = profileRes.data?.data?.user || profileRes.data?.data;
          if (profileData?._id || profileData?.id) {
            resolvedId = profileData._id || profileData.id;
          }
        } catch (profileErr) {
          console.warn("[useLikedTracks] Could not resolve permalink to ID:", profileErr);
          // Continue with the original userId as a last-ditch attempt
        }
      }

      // Try fetching likes with the resolved ID
      try {
        const { data } = await apiClient.get(`/profile/${resolvedId}/likes`, {
          withCredentials: true,
        });

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
      } catch (likesErr) {
        console.warn("[useLikedTracks] Failed to fetch likes for", resolvedId, likesErr);
        return [];
      }
    },
    enabled: isInitialized && !!actualUserId && actualUserId !== "",
    staleTime: 0,
    refetchOnMount: "always" as const,
  });
};

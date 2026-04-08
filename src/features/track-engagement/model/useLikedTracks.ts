import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { TrackNode } from "./types";

export const LIKED_TRACKS_QUERY_KEY = ["liked-tracks"] as const;

/**
 * Fetch the user's liked track list —
 * The backend team added /profile/{userId}/likes for this.
 */
export const useLikedTracks = (userId: string = "me") => {
  return useQuery<TrackNode[], Error>({
    queryKey: [...LIKED_TRACKS_QUERY_KEY, userId],
    queryFn: async (): Promise<TrackNode[]> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await apiClient.get(`${apiUrl}/profile/${userId}/likes`, {
          withCredentials: true,
        });
        return data.data ?? data ?? []; // Handle standard API response wrapping
      } catch (err) {
        console.error('Failed to fetch liked tracks:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

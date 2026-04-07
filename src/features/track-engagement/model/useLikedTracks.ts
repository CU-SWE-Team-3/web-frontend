import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";

export const LIKED_TRACKS_QUERY_KEY = ["liked-tracks"] as const;

/**
 * There is no dedicated "GET liked tracks" endpoint in the YAML spec.
 * The YAML only provides POST/DELETE /tracks/{id}/like for toggling.
 * We keep this hook as a query to fetch the user's liked track list —
 * when the backend adds the endpoint it will just work.
 */
export const useLikedTracks = (userId: string = "me") => {
  return useQuery<any[], Error>({
    queryKey: [...LIKED_TRACKS_QUERY_KEY, userId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await apiClient.get(`${apiUrl}/users/${userId}/likes`, {
        withCredentials: true,
      });
      return data.data ?? data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

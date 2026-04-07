import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TrackNode } from "./types";

export const LIKED_TRACKS_QUERY_KEY = ["liked-tracks"] as const;

export const useLikedTracks = (userId: string = "me") => {
  return useQuery<TrackNode[], Error>({
    queryKey: [...LIKED_TRACKS_QUERY_KEY, userId],
    queryFn: async (): Promise<TrackNode[]> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.get(`${apiUrl}/profile/${userId}/likes`);
        return data.data || data; // Handle standard API response wrapping
      } catch (err) {
        console.error('Failed to fetch liked tracks:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

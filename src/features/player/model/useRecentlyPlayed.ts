import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Track } from "./playerStore";

// Based on HistoryRecord schema in YAML
export interface HistoryRecord {
  id: string;
  track: Track;
  progressSeconds: number;
  lastPlayedAt: string;
}

export const RECENTLY_PLAYED_QUERY_KEY = ["recently-played"] as const;

export const useRecentlyPlayed = () => {
  return useQuery<HistoryRecord[], Error>({
    queryKey: RECENTLY_PLAYED_QUERY_KEY,
    queryFn: async (): Promise<HistoryRecord[]> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.get(`${apiUrl}/history/recently-played`);
        return data.data?.recentlyPlayed || data.recentlyPlayed || data || [];
      } catch (err) {
        console.error('Failed to fetch recently played tracks:', err);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

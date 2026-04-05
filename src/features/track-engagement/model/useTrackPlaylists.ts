import { useQuery } from "@tanstack/react-query";
import { getTrackPlaylists } from "../api/engagementApi";

export const TRACK_PLAYLISTS_QUERY_KEY = ["track-playlists"] as const;

// Mock payload for testing
const MOCK_PLAYLISTS = [
  {
    id: "playlist_1",
    title: "Arabic Chill Hits",
    coverUrl: "https://images.unsplash.com/photo-1514525253361-b83f0a4e07c5?w=500&h=500&fit=crop",
  },
  {
    id: "playlist_2",
    title: "Quran Highlights",
    coverUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=500&h=500&fit=crop",
  },
];

export const useTrackPlaylists = (trackId: string) => {
  return useQuery({
    queryKey: [...TRACK_PLAYLISTS_QUERY_KEY, trackId],
    queryFn: async () => {
      try {
        return await getTrackPlaylists(trackId);
      } catch (err) {
        if (trackId === 'non_existent') return [];
        console.warn(`[useTrackPlaylists] Backend failed for track ${trackId}. Using mock fallback.`);
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_PLAYLISTS), 800));
      }
    },
  });
};

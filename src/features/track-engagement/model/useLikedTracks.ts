import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TrackNode } from "./types";

export const LIKED_TRACKS_QUERY_KEY = ["liked-tracks"] as const;

// Detailed mock payload matching the screenshot
const MOCK_LIKED_TRACKS: TrackNode[] = [
  {
    id: "track_1",
    title: "سورة البقرة | اسلام صبحي",
    artist: "Quran| قرآن",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop", // Reliable unsplash placeholder
    createdAt: "4 years ago",
    durationFormatted: "2:00:53",
    playCount: 3060000,
    likeCount: 41800,
    repostCount: 1198,
    commentCount: 1131,
    isLiked: true,
  },
];

export const useLikedTracks = (userId: string = "me") => {
  return useQuery<TrackNode[], Error>({
    queryKey: [...LIKED_TRACKS_QUERY_KEY, userId],
    queryFn: async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // There is no documented GET endpoint in the provided snippet, so we simulate failure and fallback
        const { data } = await axios.get(`${apiUrl}/users/${userId}/likes`);
        return data;
      } catch (err) {
        console.warn("[useLikedTracks] Using mock fallback to mimic UI screenshot.");
        return new Promise((resolve) =>
          setTimeout(() => resolve(MOCK_LIKED_TRACKS), 600)
        );
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

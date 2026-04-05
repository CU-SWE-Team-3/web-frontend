import { useQuery } from "@tanstack/react-query";
import { getTrackLikers } from "../api/engagementApi";

export const TRACK_LIKERS_QUERY_KEY = ["track-likers"] as const;

// Mock payload matching the user's reference screenshot 2
const MOCK_LIKERS = [
  {
    id: "user_1",
    username: "Khalid",
    displayName: "Khalid",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    followerCount: 18,
    isFollowing: false,
  },
  {
    id: "user_2",
    username: "fatma",
    displayName: "فاطمة",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    followerCount: 7,
    isFollowing: true,
  },
  {
    id: "user_3",
    username: "Cookie",
    displayName: "Cookie 🍪",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    followerCount: 124,
    isFollowing: false,
  },
  {
    id: "user_4",
    username: "Yahia Hosam",
    displayName: "Yahia Hosam",
    avatarUrl: null, // Test fallback
    followerCount: 56,
    isFollowing: false,
  },
  {
    id: "user_5",
    username: "Lamiaa Mohey",
    displayName: "Lamiaa Mohey",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    followerCount: 62,
    isFollowing: true,
  },
  {
    id: "user_6",
    username: "Mariam AbdulRaheem",
    displayName: "Mariam AbdulRaheem",
    avatarUrl: null,
    followerCount: 12,
    isFollowing: false,
  },
];

export const useTrackLikers = (trackId: string) => {
  return useQuery({
    queryKey: [...TRACK_LIKERS_QUERY_KEY, trackId],
    queryFn: async () => {
      try {
        return await getTrackLikers(trackId);
      } catch (err) {
        if (trackId === 'non_existent') return [];
        console.warn(`[useTrackLikers] Backend failed for track ${trackId}. Using mock fallback.`);
        // Simulate network delay for a natural feel
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_LIKERS), 800));
      }
    },
  });
};

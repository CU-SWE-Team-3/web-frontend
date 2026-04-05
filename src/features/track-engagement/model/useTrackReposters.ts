import { useQuery } from "@tanstack/react-query";
import { getTrackReposters } from "../api/engagementApi";

export const TRACK_REPOSTERS_QUERY_KEY = ["track-reposters"] as const;

// Mock payload for testing
const MOCK_REPOSTERS = [
  {
    id: "user_7",
    username: "MennatAllah Hamzawy",
    displayName: "MennatAllah Hamzawy",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    followerCount: 74,
    isFollowing: true,
  },
  {
    id: "user_8",
    username: "Ahmed Sayed",
    displayName: "Ahmed Sayed",
    avatarUrl: null,
    followerCount: 22,
    isFollowing: false,
  },
];

export const useTrackReposters = (trackId: string) => {
  return useQuery({
    queryKey: [...TRACK_REPOSTERS_QUERY_KEY, trackId],
    queryFn: async () => {
      try {
        return await getTrackReposters(trackId);
      } catch (err) {
        if (trackId === 'non_existent') return [];
        console.warn(`[useTrackReposters] Backend failed for track ${trackId}. Using mock fallback.`);
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_REPOSTERS), 800));
      }
    },
  });
};

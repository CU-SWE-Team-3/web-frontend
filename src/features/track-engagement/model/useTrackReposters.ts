import { useQuery } from "@tanstack/react-query";
import { getTrackReposters } from "../api/engagementApi";

export const TRACK_REPOSTERS_QUERY_KEY = ["track-reposters"] as const;

export const useTrackReposters = (trackId: string) => {
  return useQuery({
    queryKey: [...TRACK_REPOSTERS_QUERY_KEY, trackId],
    queryFn: () => getTrackReposters(trackId),
    enabled: Boolean(trackId),
  });
};

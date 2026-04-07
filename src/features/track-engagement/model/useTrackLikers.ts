import { useQuery } from "@tanstack/react-query";
import { getTrackLikers } from "../api/engagementApi";

export const TRACK_LIKERS_QUERY_KEY = ["track-likers"] as const;

export const useTrackLikers = (trackId: string) => {
  return useQuery({
    queryKey: [...TRACK_LIKERS_QUERY_KEY, trackId],
    queryFn: () => getTrackLikers(trackId),
    enabled: Boolean(trackId),
  });
};

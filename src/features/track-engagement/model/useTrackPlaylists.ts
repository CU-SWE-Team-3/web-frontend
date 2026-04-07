import { useQuery } from "@tanstack/react-query";
import { getTrackPlaylists } from "../api/engagementApi";

export const TRACK_PLAYLISTS_QUERY_KEY = ["track-playlists"] as const;

export const useTrackPlaylists = (trackId: string) => {
  return useQuery({
    queryKey: [...TRACK_PLAYLISTS_QUERY_KEY, trackId],
    queryFn: () => getTrackPlaylists(trackId),
    enabled: Boolean(trackId),
  });
};

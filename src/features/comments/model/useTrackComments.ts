import { useQuery } from "@tanstack/react-query";
import { getTrackComments } from "../api/commentsApi";
import type { TrackComment } from "./types";

export const TRACK_COMMENTS_QUERY_KEY = ["track-comments"] as const;

export const useTrackComments = (trackId: string) => {
  return useQuery<TrackComment[], Error>({
    queryKey: [...TRACK_COMMENTS_QUERY_KEY, trackId],
    queryFn: () => getTrackComments(trackId),
    enabled: Boolean(trackId),
  });
};

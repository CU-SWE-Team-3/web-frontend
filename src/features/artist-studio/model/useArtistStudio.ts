import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { artistStudioRepository } from "../api/artistStudioRepository";
import type { ArtistStudioSummary, ArtistStudioTrack } from "../api/artistStudioRepository";
import { tracksRepository } from "@/features/tracks/api/tracksRepository";
import { usePendingTracksStore } from "@/features/tracks/model/pendingTracksStore";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

export const ARTIST_STUDIO_QUERY_KEY = ["artist-studio"] as const;

export function useArtistStudio() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const pendingTracks = usePendingTracksStore((state) => state.pendingTracks);

  const query = useQuery({
    queryKey: ARTIST_STUDIO_QUERY_KEY,
    queryFn: () => artistStudioRepository.getSummary(),
    enabled: isInitialized,
    staleTime: 0,
    refetchOnMount: "always" as const,
  });

  const data = useMemo<ArtistStudioSummary | undefined>(() => {
    if (!query.data && pendingTracks.length === 0) return query.data;

    const merged = new Map<string, ArtistStudioTrack>();

    for (const track of query.data?.tracks ?? []) {
      merged.set(track.id, track);
    }

    for (const track of pendingTracks) {
      merged.set(track.id, {
        ...track,
        commentsTotal: track.commentCount ?? 0,
        repostsTotal: track.repostCount ?? 0,
        downloadsTotal: track.downloadCount ?? 0,
      });
    }

    const tracks = Array.from(merged.values());

    return {
      tracks,
      totals: {
        tracks: tracks.length,
        plays: tracks.reduce((sum, track) => sum + (track.playCount ?? 0), 0),
        reposts: tracks.reduce((sum, track) => sum + track.repostsTotal, 0),
        downloads: tracks.reduce((sum, track) => sum + track.downloadsTotal, 0),
        comments: tracks.reduce((sum, track) => sum + track.commentsTotal, 0),
      },
    };
  }, [pendingTracks, query.data]);

  return {
    ...query,
    data,
  };
}

export function useDownloadStudioTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => tracksRepository.downloadTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTIST_STUDIO_QUERY_KEY });
    },
  });
}

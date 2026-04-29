import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { artistStudioRepository } from "../api/artistStudioRepository";
import { tracksRepository } from "@/features/tracks/api/tracksRepository";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

export const ARTIST_STUDIO_QUERY_KEY = ["artist-studio"] as const;

export function useArtistStudio() {
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return useQuery({
    queryKey: ARTIST_STUDIO_QUERY_KEY,
    queryFn: () => artistStudioRepository.getSummary(),
    enabled: isInitialized,
    staleTime: 30_000,
  });
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

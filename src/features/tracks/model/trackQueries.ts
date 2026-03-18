import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { tracksRepository } from "../api/tracksRepository";
import type { Track, UpdateTrackInput, UploadTrackInput } from "./track";

export const TRACKS_QUERY_KEY = ["tracks"] as const;

export function useTracks() {
  return useQuery({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: () => tracksRepository.getTracks(),
  });
}

export function useTrack(trackId?: string) {
  return useQuery({
    queryKey: [...TRACKS_QUERY_KEY, trackId],
    queryFn: () => tracksRepository.getTrackById(trackId as string),
    enabled: Boolean(trackId),
  });
}

export function useUploadTrack(
  options?:
    UseMutationOptions<
      Track,
      Error,
      { payload: UploadTrackInput; onProgress?: (progress: number) => void }
    >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, onProgress }) =>
      tracksRepository.uploadTrack(payload, onProgress),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateTrack(
  options?: UseMutationOptions<Track, Error, { id: string; updates: UpdateTrackInput }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => tracksRepository.updateTrack(id, updates),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TRACKS_QUERY_KEY, variables.id] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteTrack(
  options?: UseMutationOptions<{ success: boolean }, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => tracksRepository.deleteTrack(id),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

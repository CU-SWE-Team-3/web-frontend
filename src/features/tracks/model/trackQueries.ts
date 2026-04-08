import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { tracksRepository } from "../api/tracksRepository";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import type { Track, UpdateTrackInput, UploadTrackInput } from "./track";

export const TRACKS_QUERY_KEY = ["tracks"] as const;

/**
 * Fetch all tracks for the current user.
 * Waits for auth to be initialized before firing.
 * Always refetches from the backend on mount.
 */
export function useTracks() {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return useQuery({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: () => tracksRepository.getTracks(),
    enabled: isInitialized,
    staleTime: 0,
    refetchOnMount: "always" as const,
  });
}

/**
 * Fetch a single track by ID.
 */
export function useTrack(trackId?: string) {
  return useQuery({
    queryKey: [...TRACKS_QUERY_KEY, trackId],
    queryFn: () => tracksRepository.getTrackById(trackId as string),
    enabled: Boolean(trackId),
  });
}

/**
 * Upload a new track.
 * Invalidates all tracks queries on success so profile/my-tracks refetch.
 */
export function useUploadTrack(
  options?:
    UseMutationOptions<
      Track,
      Error,
      { payload: UploadTrackInput; onProgress?: (progress: number) => void; audioFile?: File }
    >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, onProgress, audioFile }) =>
      tracksRepository.uploadTrack(payload, onProgress, audioFile),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate all tracks-related queries so they refetch from backend
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

/**
 * Fetch tracks for a specific user by username/permalink.
 * Waits for auth to be initialized before firing.
 * Always refetches from the backend on mount.
 */
export function useUserTracks(username: string) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return useQuery({
    queryKey: [...TRACKS_QUERY_KEY, "user", username],
    queryFn: () => tracksRepository.getTracksByArtist(username),
    enabled: Boolean(username) && isInitialized,
    staleTime: 0,
    refetchOnMount: "always" as const,
  });
}

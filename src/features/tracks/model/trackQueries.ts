import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { tracksRepository } from "../api/tracksRepository";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import type { Track, UpdateTrackInput, UploadTrackInput } from "./track";
import { usePendingTracksStore } from "./pendingTracksStore";

export const TRACKS_QUERY_KEY = ["tracks"] as const;

function mergeTracksWithPending(tracks: Track[], pendingTracks: Track[]) {
  const merged = new Map<string, Track>();

  for (const track of tracks) {
    merged.set(track.id, track);
  }

  for (const track of pendingTracks) {
    if (!merged.has(track.id)) {
      merged.set(track.id, track);
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function isOwnTrackView(username: string, user: ReturnType<typeof useAuthStore.getState>["user"]) {
  if (!user) return username === "me";

  return new Set(
    ["me", user.id, (user as any)?._id, user.username, user.permalink].filter(Boolean),
  ).has(username);
}

/**
 * Fetch all tracks for the current user.
 * Waits for auth to be initialized before firing.
 * Always refetches from the backend on mount.
 */
export function useTracks() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const pendingTracks = usePendingTracksStore((s) => s.pendingTracks);
  const removeResolvedPendingTracks = usePendingTracksStore((s) => s.removeResolvedPendingTracks);

  const query = useQuery({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: () => tracksRepository.getTracks(),
    enabled: isInitialized,
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchInterval: pendingTracks.length > 0 ? 5_000 : false,
  });

  useEffect(() => {
    if (!query.isFetched) return;
    removeResolvedPendingTracks((query.data ?? []).map((track) => track.id));
  }, [query.data, query.isFetched, removeResolvedPendingTracks]);

  const data = useMemo(
    () => mergeTracksWithPending(query.data ?? [], pendingTracks),
    [query.data, pendingTracks],
  );

  return {
    ...query,
    data,
  };
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
  const upsertPendingTrack = usePendingTracksStore((s) => s.upsertPendingTrack);

  return useMutation({
    mutationFn: ({ payload, onProgress, audioFile }) =>
      tracksRepository.uploadTrack(payload, onProgress, audioFile),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      upsertPendingTrack(data);
      queryClient.setQueryData<Track[]>(TRACKS_QUERY_KEY, (current = []) =>
        mergeTracksWithPending(current, [data]),
      );
      queryClient.setQueryData<Track>([...TRACKS_QUERY_KEY, data.id], data);
      queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY, refetchType: "active" });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateTrack(
  options?: UseMutationOptions<Track, Error, { id: string; updates: UpdateTrackInput }>,
) {
  const queryClient = useQueryClient();
  const upsertPendingTrack = usePendingTracksStore((s) => s.upsertPendingTrack);

  return useMutation({
    mutationFn: ({ id, updates }) => tracksRepository.updateTrack(id, updates),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      upsertPendingTrack(data);
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
  const removePendingTrack = usePendingTracksStore((s) => s.removePendingTrack);

  return useMutation({
    mutationFn: (id) => tracksRepository.deleteTrack(id),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      removePendingTrack(variables);
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
  const user = useAuthStore((s) => s.user);
  const pendingTracks = usePendingTracksStore((s) => s.pendingTracks);
  const removeResolvedPendingTracks = usePendingTracksStore((s) => s.removeResolvedPendingTracks);
  const ownTrackView = isOwnTrackView(username, user);

  const query = useQuery({
    queryKey: [...TRACKS_QUERY_KEY, "user", username],
    queryFn: () => tracksRepository.getTracksByArtist(username),
    enabled: Boolean(username) && isInitialized,
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchInterval: ownTrackView && pendingTracks.length > 0 ? 5_000 : false,
  });

  useEffect(() => {
    if (!query.isFetched) return;
    removeResolvedPendingTracks((query.data ?? []).map((track) => track.id));
  }, [query.data, query.isFetched, removeResolvedPendingTracks]);

  const data = useMemo(() => {
    if (!ownTrackView) {
      return query.data ?? [];
    }

    return mergeTracksWithPending(query.data ?? [], pendingTracks);
  }, [ownTrackView, pendingTracks, query.data]);

  return {
    ...query,
    data,
  };
}

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { playlistsRepository } from '../api/playlistsRepository';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import type {
  Playlist,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from './playlist';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const PLAYLISTS_QUERY_KEY = ['playlists'] as const;

function playlistKeys(id: string) {
  return [...PLAYLISTS_QUERY_KEY, id] as const;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch all playlists with optional filters.
 */
export function usePlaylists(params?: {
  creator?: string;
  releaseType?: string;
}) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return useQuery({
    queryKey: [...PLAYLISTS_QUERY_KEY, 'list', params ?? {}],
    queryFn: () => playlistsRepository.getPlaylists(params),
    enabled: isInitialized,
    staleTime: 30_000,
  });
}

/**
 * Fetch playlists for a specific user, optionally filtered by release type.
 */
export function useUserPlaylists(userId?: string, releaseType?: string) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return useQuery({
    queryKey: [...PLAYLISTS_QUERY_KEY, 'user', userId, releaseType],
    queryFn: () =>
      playlistsRepository.getPlaylists({
        creator: userId,
        releaseType,
      }),
    enabled: isInitialized && Boolean(userId),
    staleTime: 30_000,
  });
}

/**
 * Fetch a single playlist by ID with populated tracks.
 */
export function usePlaylist(id?: string, secretToken?: string) {
  return useQuery({
    queryKey: [...PLAYLISTS_QUERY_KEY, id, secretToken],
    queryFn: () => playlistsRepository.getPlaylistById(id!, secretToken),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

/**
 * Fetch embed code for a playlist.
 */
export function usePlaylistEmbed(id?: string, secretToken?: string) {
  return useQuery({
    queryKey: [...PLAYLISTS_QUERY_KEY, 'embed', id],
    queryFn: () => playlistsRepository.getEmbed(id!, secretToken),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create a new playlist.
 */
export function useCreatePlaylist(
  options?: UseMutationOptions<Playlist, Error, CreatePlaylistInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlaylistInput) =>
      playlistsRepository.createPlaylist(input),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

/**
 * Update playlist metadata.
 */
export function useUpdatePlaylist(
  options?: UseMutationOptions<
    Playlist,
    Error,
    { id: string; input: UpdatePlaylistInput }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }) =>
      playlistsRepository.updatePlaylist(id, input),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(playlistKeys(variables.id), data);
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

/**
 * Delete a playlist.
 */
export function useDeletePlaylist(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlistsRepository.deletePlaylist(id),
    ...options,
    onSuccess: (data, id, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: playlistKeys(id) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSuccess?.(data, id, onMutateResult, context);
    },
  });
}

/**
 * Update tracks in a playlist (reorder / add / remove).
 * Supports optimistic UI by immediately updating cache.
 */
export function useUpdatePlaylistTracks(
  options?: UseMutationOptions<
    Playlist,
    Error,
    { id: string; trackIds: string[] }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackIds }) =>
      playlistsRepository.updateTracks(id, trackIds),
    onMutate: async ({ id, trackIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: playlistKeys(id) });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<Playlist>(playlistKeys(id));

      // Optimistically update the cache
      if (previous) {
        queryClient.setQueryData<Playlist>(playlistKeys(id), {
          ...previous,
          tracks: trackIds as any, // Will become populated on next refetch
          trackCount: trackIds.length,
        });
      }

      return { previous };
    },
    onError: (_err, { id }, context: any) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys(id), context.previous);
      }
    },
    onSettled: (_data, _err, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: playlistKeys(id) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
    },
    ...options,
  });
}

/**
 * Upload playlist artwork.
 */
export function useUploadPlaylistArtwork(
  options?: UseMutationOptions<Playlist, Error, { id: string; file: File }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }) =>
      playlistsRepository.uploadArtwork(id, file),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(playlistKeys(variables.id), data);
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

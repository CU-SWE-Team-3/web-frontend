import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import {
  playlistsRepository,
  type PlaylistLikeResult,
} from '../api/playlistsRepository';
import { tracksRepository } from '@/features/tracks/api/tracksRepository';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import type {
  Playlist,
  PlaylistCreator,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from './playlist';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const PLAYLISTS_QUERY_KEY = ['playlists'] as const;

function playlistKeys(id: string) {
  return [...PLAYLISTS_QUERY_KEY, id] as const;
}

interface PlaylistEngagementState {
  likedIds: Set<string>;
}

function getImageUrl(value: any): string {
  if (!value || value === 'undefined' || value === 'null') return '';
  if (typeof value === 'string') return value;
  return (
    value.artworkUrl ||
    value.artwork_url ||
    value.coverUrl ||
    value.cover_url ||
    value.imageUrl ||
    value.image_url ||
    value.thumbnailUrl ||
    value.thumbnail_url ||
    value.secureUrl ||
    value.secure_url ||
    value.publicUrl ||
    value.public_url ||
    value.fileUrl ||
    value.file_url ||
    value.downloadUrl ||
    value.download_url ||
    value.url ||
    value.src ||
    ''
  );
}

function isUsableImageUrl(value: any): boolean {
  const url = getImageUrl(value).trim();
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower !== 'undefined' &&
    lower !== 'null' &&
    !lower.includes('default-track-artwork') &&
    !lower.includes('placeholder')
  );
}

function getTrackId(track: any): string {
  return typeof track === 'string' ? track : track?._id || track?.id || '';
}

function getTrackLookup(track: any): string {
  return typeof track === 'string'
    ? track
    : track?.permalink || track?._id || track?.id || '';
}

function getPlaylistId(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || value.targetId || value.playlistId || '';
}

function getCurrentUserId(): string {
  const user = useAuthStore.getState().user as any;
  return user?._id || user?.id || '';
}

function extractInteractionItems(payload: any, keys: string[]): any[] {
  const candidates = [
    ...keys.map((key) => payload?.data?.[key]),
    payload?.data?.data,
    payload?.data,
    ...keys.map((key) => payload?.[key]),
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

async function getCurrentUserPlaylistEngagement(): Promise<PlaylistEngagementState> {
  const userId = getCurrentUserId();
  if (!userId) return { likedIds: new Set() };

  const likesResult = await Promise.resolve(
    apiClient.get(`/profile/${userId}/likes`, { withCredentials: true }),
  ).then(
    (value) => ({ status: 'fulfilled' as const, value }),
    () => ({ status: 'rejected' as const }),
  );

  const likedIds = new Set<string>();

  if (likesResult.status === 'fulfilled') {
    const likes = extractInteractionItems(likesResult.value?.data, ['likes', 'likedTracks']);
    for (const item of likes) {
      if ((item?.targetModel || item?.model) !== 'Playlist') continue;
      const id = getPlaylistId(item.target || item.playlist || item);
      if (id) likedIds.add(id);
    }
  }

  return { likedIds };
}

function isMissingTrack(track: any): boolean {
  return !track || track.__missing === true;
}

function getCurrentUserAsCreator(creatorId: string): PlaylistCreator | null {
  const user = useAuthStore.getState().user as any;
  if (!user) return null;

  const ids = [user._id, user.id].filter(Boolean);
  if (!ids.includes(creatorId)) return null;

  return {
    _id: user._id || user.id,
    displayName: user.displayName || user.username || user.permalink || 'Unknown',
    permalink: user.permalink || user.username || user._id || user.id,
    avatarUrl: user.avatarUrl || null,
    isPremium: user.isPremium,
  };
}

async function resolveCreator(creator: Playlist['creator']): Promise<Playlist['creator']> {
  if (!creator || typeof creator !== 'string') return creator;

  const currentUserCreator = getCurrentUserAsCreator(creator);
  if (currentUserCreator) return currentUserCreator;

  try {
    const response = await apiClient.get(`/profile/${creator}`, { withCredentials: true });
    const user = response.data?.data?.user || response.data?.data || response.data;
    if (user) {
      return {
        _id: user._id || user.id || creator,
        displayName: user.displayName || user.username || user.permalink || creator,
        permalink: user.permalink || user.username || creator,
        avatarUrl: user.avatarUrl || null,
        isPremium: user.isPremium,
      };
    }
  } catch (err) {
    console.warn(`[playlistQueries] Failed to resolve playlist creator ${creator}:`, err);
  }

  return creator;
}

async function normalizePlaylist(raw: Playlist, engagement?: PlaylistEngagementState): Promise<Playlist> {
  const hasTracksArray = Array.isArray(raw.tracks);
  const tracks = hasTracksArray
    ? (raw.tracks || []).filter((track) => !isMissingTrack(track))
    : [];
  const rawTrackCount = raw.trackCount ?? (raw as any).track_count ?? 0;
  const creator = await resolveCreator(raw.creator);
  const id = raw._id || (raw as any).id;

  return {
    ...raw,
    creator,
    tracks,
    artworkUrl: getImageUrl(raw.artworkUrl || (raw as any).artwork_url || (raw as any).artwork),
    isPrivate: raw.isPrivate ?? (raw as any).is_private ?? false,
    trackCount: tracks.length > 0 ? tracks.length : rawTrackCount,
    totalDuration: raw.totalDuration ?? (raw as any).total_duration ?? 0,
    likeCount: raw.likeCount ?? (raw as any).like_count ?? 0,
    repostCount: raw.repostCount ?? (raw as any).repost_count ?? 0,
    isLiked: Boolean(
      raw.isLiked ||
      (raw as any).is_liked ||
      (raw as any).liked ||
      (raw as any).hasLiked ||
      (raw as any).likedByMe ||
      (id ? engagement?.likedIds.has(id) : false),
    ),
  };
}

async function verifyPlaylistTracks(
  playlist: Playlist,
  queryClient?: ReturnType<typeof useQueryClient>,
): Promise<Playlist> {
  const hydrated = await Promise.all(
    (playlist.tracks || []).map(async (t) => {
      const trackId = getTrackId(t);
      const trackLookup = getTrackLookup(t);
      if (!trackLookup) return null;

      try {
        const cached =
          (trackId && queryClient ? queryClient.getQueryData(['tracks', trackId]) : null) ||
          (queryClient ? queryClient.getQueryData(['tracks', trackLookup]) : null);
        if (cached && (cached as any).hlsUrl) return mapTrackToSummary(cached);

        const fresh = await tracksRepository.getTrackById(trackLookup);
        return mapTrackToSummary(fresh);
      } catch (err) {
        console.warn(`[playlistQueries] Dropping missing playlist track ${trackLookup}:`, err);
        return null;
      }
    }),
  );

  const tracks = hydrated.filter((track): track is NonNullable<typeof track> => Boolean(track));

  return {
    ...playlist,
    tracks,
    trackCount: tracks.length,
    totalDuration: tracks.reduce((sum, track) => {
      return sum + (typeof track === 'string' ? 0 : track.duration || 0);
    }, 0),
  };
}

function patchPlaylistTrackState(playlist: Playlist, trackIds: string[]): Playlist {
  const previousTracksById = new Map(
    (playlist.tracks || []).map((track) => {
      const trackId = getTrackId(track);
      return [trackId, track] as const;
    }),
  );

  return {
    ...playlist,
    tracks: trackIds.map((trackId) => previousTracksById.get(trackId) || trackId) as any,
    trackCount: trackIds.length,
  };
}

function patchPlaylistQueryData(previous: unknown, playlistId: string, trackIds: string[]): unknown {
  if (!previous) return previous;

  if (Array.isArray(previous)) {
    return previous.map((item) => {
      if (item && typeof item === 'object' && (item as Playlist)._id === playlistId) {
        return patchPlaylistTrackState(item as Playlist, trackIds);
      }
      return item;
    });
  }

  if (typeof previous === 'object' && (previous as Playlist)._id === playlistId) {
    return patchPlaylistTrackState(previous as Playlist, trackIds);
  }

  return previous;
}

function patchPlaylistData(previous: unknown, playlistId: string, updater: (p: Playlist) => Playlist): unknown {
  if (!previous) return previous;

  if (Array.isArray(previous)) {
    return previous.map((item) => {
      if (item && typeof item === 'object' && (item as Playlist)._id === playlistId) {
        return updater(item as Playlist);
      }
      return item;
    });
  }

  if (typeof previous === 'object' && (previous as Playlist)._id === playlistId) {
    return updater(previous as Playlist);
  }

  return previous;
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
    queryFn: async () => {
      const [playlists, engagement] = await Promise.all([
        playlistsRepository.getPlaylists(params),
        getCurrentUserPlaylistEngagement(),
      ]);
      return Promise.all(playlists.map((playlist) => normalizePlaylist(playlist, engagement)));
    },
    enabled: isInitialized,
    staleTime: 30_000,
  });
}

/**
 * Fetch playlists for a specific user, optionally filtered by release type.
 */
export function useUserPlaylists(userId?: string, releaseType?: string) {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...PLAYLISTS_QUERY_KEY, 'user', userId, releaseType],
    queryFn: async () => {
      const [playlists, engagement] = await Promise.all([
        playlistsRepository.getPlaylists({
          creator: userId,
          releaseType,
        }),
        getCurrentUserPlaylistEngagement(),
      ]);
      return Promise.all(playlists.map(async (playlist) => {
        const normalized = await normalizePlaylist(playlist, engagement);

        if ((normalized.trackCount || 0) <= 0 && normalized.tracks.length === 0) {
          return normalized;
        }

        try {
          const fullPlaylist = await playlistsRepository.getPlaylistById(normalized._id);
          return verifyPlaylistTracks(await normalizePlaylist(fullPlaylist, engagement), queryClient);
        } catch (err) {
          console.warn(`[useUserPlaylists] Failed to verify playlist ${normalized._id}:`, err);
          return normalized;
        }
      }));
    },
    enabled: isInitialized && Boolean(userId),
    staleTime: 30_000,
  });
}

/**
 * Convert a full Track object to a TrackSummary for playlist compatibility.
 */
function mapTrackToSummary(t: any): any {
  if (typeof t === 'string') return t;
  
  // Robust mapping for playback URLs (same as in pages/cards)
  // Aligned with latest YAML: artworkUrl and hlsUrl are the primary fields
  const hls = t.hlsUrl || t.hls_url || t.audioUrl || t.audio_url || '';
  const stream = t.streamUrl || t.stream_url || hls || '';
  const artwork = getImageUrl(t.artworkUrl || t.artwork_url || t.artwork || t.coverUrl || t.cover_url || t.imageUrl || t.image_url || t.thumbnailUrl || t.thumbnail_url);
  
  let durationInSeconds = 0;
  if (typeof t.duration === 'number') {
    durationInSeconds = t.duration;
  } else if (typeof t.duration === 'string' && t.duration.includes(':')) {
    const [m, s] = t.duration.split(':').map(Number);
    durationInSeconds = (m * 60) + (s || 0);
  }

  const trackId = t._id || t.id;

  return {
    _id: trackId,
    id: trackId,
    title: t.title || 'Untitled',
    permalink: t.permalink || '',
    artworkUrl: artwork,
    duration: durationInSeconds,
    playCount: t.playCount || 0,
    likeCount: t.likeCount || 0,
    repostCount: t.repostCount || 0,
    commentCount: t.commentCount || t.comment_count || 0,
    isPublic: t.isPublic ?? t.is_public ?? true,
    hlsUrl: hls,
    streamUrl: stream,
    artist: t.artist || 'Unknown Artist',
  };
}

/**
 * Fetch a single playlist by ID with populated tracks.
 */
export function usePlaylist(id?: string, secretToken?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...PLAYLISTS_QUERY_KEY, id, secretToken],
    queryFn: async () => {
      const [raw, engagement] = await Promise.all([
        playlistsRepository.getPlaylistById(id!, secretToken),
        getCurrentUserPlaylistEngagement(),
      ]);
      
      if (!raw) return null;

      let playlist = await normalizePlaylist(raw, engagement);

      if (!playlist.tracks) return playlist;

      playlist = await verifyPlaylistTracks(playlist, queryClient);

      return playlist;
    },
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
    { id: string; trackIds: string[] },
    { previousQueries: [readonly unknown[], unknown][] }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Playlist,
    Error,
    { id: string; trackIds: string[] },
    { previousQueries: [readonly unknown[], unknown][] }
  >({
    mutationFn: ({ id, trackIds }) =>
      playlistsRepository.updateTracks(id, trackIds),
    ...options,
    onMutate: async ({ id, trackIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PLAYLISTS_QUERY_KEY });

      // Snapshot previous value for rollback
      const previousQueries = queryClient.getQueriesData({
        queryKey: PLAYLISTS_QUERY_KEY,
      });

      // Optimistically update detail, list, and modal caches.
      queryClient.setQueriesData({ queryKey: PLAYLISTS_QUERY_KEY }, (previous) =>
        patchPlaylistQueryData(previous, id, trackIds),
      );

      return { previousQueries };
    },
    onError: (err, variables, onMutateResult, context) => {
      // Rollback on error
      if (onMutateResult?.previousQueries) {
        onMutateResult.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      options?.onError?.(err, variables, onMutateResult, context);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onSettled: (data, err, variables, onMutateResult, context) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: playlistKeys(variables.id) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSettled?.(data, err, variables, onMutateResult, context);
    },
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

/**
 * Like a playlist.
 */
export function useLikePlaylist(
  options?: UseMutationOptions<PlaylistLikeResult, Error, string, { previousQueries: [readonly unknown[], unknown][] }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlistsRepository.likePlaylist(id),
    ...options,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      const previousQueries = queryClient.getQueriesData({ queryKey: PLAYLISTS_QUERY_KEY });

      queryClient.setQueriesData({ queryKey: PLAYLISTS_QUERY_KEY }, (previous) =>
        patchPlaylistData(previous, id, (p) => ({
          ...p,
          isLiked: true,
          likeCount: (p.likeCount || 0) + 1
        }))
      );

      return { previousQueries };
    },
    onError: (err, id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, id, onMutateResult, context) => {
      queryClient.setQueriesData({ queryKey: PLAYLISTS_QUERY_KEY }, (previous) =>
        patchPlaylistData(previous, id, (p) => ({
          ...p,
          isLiked: data.liked,
          likeCount: data.newLikeCount ?? p.likeCount,
        })),
      );
      options?.onSuccess?.(data, id, onMutateResult, context);
    },
    onSettled: (data, err, id, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys(id) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSettled?.(data, err, id, onMutateResult, context);
    },
  });
}

/**
 * Unlike a playlist.
 */
export function useUnlikePlaylist(
  options?: UseMutationOptions<PlaylistLikeResult, Error, string, { previousQueries: [readonly unknown[], unknown][] }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlistsRepository.unlikePlaylist(id),
    ...options,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      const previousQueries = queryClient.getQueriesData({ queryKey: PLAYLISTS_QUERY_KEY });

      queryClient.setQueriesData({ queryKey: PLAYLISTS_QUERY_KEY }, (previous) =>
        patchPlaylistData(previous, id, (p) => ({
          ...p,
          isLiked: false,
          likeCount: Math.max(0, (p.likeCount || 0) - 1)
        }))
      );

      return { previousQueries };
    },
    onError: (err, id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, id, onMutateResult, context) => {
      queryClient.setQueriesData({ queryKey: PLAYLISTS_QUERY_KEY }, (previous) =>
        patchPlaylistData(previous, id, (p) => ({
          ...p,
          isLiked: data.liked,
          likeCount: data.newLikeCount ?? p.likeCount,
        })),
      );
      options?.onSuccess?.(data, id, onMutateResult, context);
    },
    onSettled: (data, err, id, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys(id) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      options?.onSettled?.(data, err, id, onMutateResult, context);
    },
  });
}

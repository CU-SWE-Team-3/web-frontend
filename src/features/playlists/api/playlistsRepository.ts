import apiClient from '@/shared/api/client';
import type {
  Playlist,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '../model/playlist';

export interface PlaylistLikeResult {
  liked: boolean;
  newLikeCount?: number;
}

/**
 * Repository layer for Playlist API operations.
 * UI components never call these directly — they go through React Query hooks.
 */
export const playlistsRepository = {
  /**
   * GET /playlists
   * Fetch a list of playlists with optional filters.
   */
  async getPlaylists(params?: {
    creator?: string;
    releaseType?: string;
  }): Promise<Playlist[]> {
    console.log('[playlistsRepository] GET /playlists API CALL. Params:', params);
    
    try {
      const response = await apiClient.get('/playlists', { params });
      const data = response.data?.data?.playlists || response.data?.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[playlistsRepository] Primary fetch with params failed.', err);
      // If it fails (e.g., 404 or invalid ID), just return empty array
      return [];
    }
  },

  /**
   * GET /playlists/:id
   * Fetch a single playlist with fully populated tracks.
   */
  async getPlaylistById(
    id: string,
    secretToken?: string,
  ): Promise<Playlist> {
    const params: Record<string, string> = {};
    if (secretToken) params.secretToken = secretToken;

    const response = await apiClient.get(`/playlists/${id}`, { params });
    const playlist =
      response.data?.data?.playlist || response.data?.data || response.data;
    if (!playlist) throw new Error('Playlist not found');
    return playlist;
  },

  /**
   * POST /playlists
   * Create a new playlist.
   */
  async createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
    const response = await apiClient.post('/playlists', input);
    return response.data?.data?.playlist || response.data?.data;
  },

  /**
   * PATCH /playlists/:id
   * Update playlist metadata.
   */
  async updatePlaylist(
    id: string,
    input: UpdatePlaylistInput,
  ): Promise<Playlist> {
    const response = await apiClient.patch(`/playlists/${id}`, input);
    return response.data?.data?.playlist || response.data?.data;
  },

  /**
   * DELETE /playlists/:id
   * Delete a playlist permanently.
   */
  async deletePlaylist(id: string): Promise<void> {
    await apiClient.delete(`/playlists/${id}`);
  },

  /**
   * PUT /playlists/:id/tracks
   * Replace the entire tracks array (reorder, add, remove).
   */
  async updateTracks(
    id: string,
    trackIds: string[],
  ): Promise<Playlist> {
    const response = await apiClient.put(`/playlists/${id}/tracks`, { tracks: trackIds });
    return response.data?.data?.playlist || response.data?.data || response.data;
  },

  /**
   * PATCH /playlists/:id/artwork
   * Upload a playlist cover image (multipart/form-data).
   */
  async uploadArtwork(id: string, file: File): Promise<Playlist> {
    const formData = new FormData();
    formData.append('artwork', file);

    const response = await apiClient.patch(
      `/playlists/${id}/artwork`,
      formData,
      {
        timeout: 60_000,
        headers: {
          'Content-Type': undefined, // Let browser set multipart boundary
        },
      },
    );
    return response.data?.data?.playlist || response.data?.data;
  },

  /**
   * GET /playlists/:id/embed
   * Get an HTML iframe embed snippet.
   */
  async getEmbed(
    id: string,
    secretToken?: string,
  ): Promise<{ iframeCode: string; playlistId: string }> {
    const params: Record<string, string> = {};
    if (secretToken) params.secretToken = secretToken;

    const response = await apiClient.get(`/playlists/${id}/embed`, { params });
    return response.data?.data || response.data;
  },

  /**
   * Interaction: LIKE
   */
  async likePlaylist(id: string): Promise<PlaylistLikeResult> {
    try {
      const response = await apiClient.post(`/tracks/${id}/like`, { targetModel: 'Playlist' });
      return response.data?.data || { liked: true };
    } catch (err: any) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && /already liked/i.test(message)) {
        return { liked: true };
      }
      throw err;
    }
  },

  /**
   * Interaction: UNLIKE
   */
  async unlikePlaylist(id: string): Promise<PlaylistLikeResult> {
    try {
      const response = await apiClient.delete(`/tracks/${id}/like`, {
        data: { targetModel: 'Playlist' }
      });
      return response.data?.data || { liked: false };
    } catch (err: any) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && /not liked|have not liked/i.test(message)) {
        return { liked: false };
      }
      throw err;
    }
  },
};

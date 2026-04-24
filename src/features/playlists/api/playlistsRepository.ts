import apiClient from '@/shared/api/client';
import type {
  Playlist,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '../model/playlist';

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
   * PATCH /playlists/:id
   * Replace the entire tracks array (reorder, add, remove).
   */
  async updateTracks(
    id: string,
    trackIds: string[],
  ): Promise<Playlist> {
    try {
      const response = await apiClient.patch(`/playlists/${id}`, {
        tracks: trackIds,
      });
      return response.data?.data?.playlist || response.data?.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // Fallback to the old endpoint if PATCH doesn't accept tracks
        const response2 = await apiClient.put(`/playlists/${id}/tracks`, { tracks: trackIds });
        return response2.data?.data?.playlist || response2.data?.data;
      }
      throw err;
    }
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
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
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
};

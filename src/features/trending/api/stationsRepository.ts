import apiClient from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StationType = 'genre' | 'artist' | 'trending' | 'curated' | 'recommended';

export interface LikeStationRequest {
  stationType: StationType;
  stationTitle?: string;
  stationDescription?: string;
  artistId?: string;
  genre?: string;
}

export interface LikeStationResult {
  liked: boolean;
  stationId?: string;
  stationType?: StationType;
  stationTitle?: string;
  likedAt?: string;
}

export interface HydratedStation {
  stationId: string;
  stationType: StationType;
  stationTitle: string;
  stationDescription?: string;
  artistId?: string | null;
  genre?: string | null;
  likedAt: string;
  tracks: any[];
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const stationsRepository = {
  /**
   * POST /stations/{stationId}/like
   * Like a station. Requires stationType in the body.
   */
  async likeStation(stationId: string, payload: LikeStationRequest): Promise<LikeStationResult> {
    try {
      const response = await apiClient.post(`/stations/${encodeURIComponent(stationId)}/like`, payload);
      return response.data?.data || { liked: true };
    } catch (err: any) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && /already liked/i.test(message)) {
        return { liked: true, stationId };
      }
      throw err;
    }
  },

  /**
   * DELETE /stations/{stationId}/like
   * Unlike a station.
   */
  async unlikeStation(stationId: string): Promise<LikeStationResult> {
    try {
      const response = await apiClient.delete(`/stations/${encodeURIComponent(stationId)}/like`);
      return response.data?.data || { liked: false };
    } catch (err: any) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && /not liked|have not liked/i.test(message)) {
        return { liked: false, stationId };
      }
      throw err;
    }
  },

  /**
   * GET /stations/{stationId}/like
   * Check if the current user has liked a specific station.
   */
  async checkStationLiked(stationId: string): Promise<{ liked: boolean }> {
    try {
      const response = await apiClient.get(`/stations/${encodeURIComponent(stationId)}/like`);
      return response.data?.data || { liked: false };
    } catch {
      return { liked: false };
    }
  },

  /**
   * GET /stations/liked
   * Get all liked stations for the current user.
   * Set hydrate=false for lightweight (no tracks) response.
   */
  async getLikedStations(hydrate = true): Promise<HydratedStation[]> {
    try {
      const response = await apiClient.get('/stations/liked', {
        params: { hydrate: String(hydrate) },
      });
      const data = response.data?.data;
      const stations = data?.stations || data;
      return Array.isArray(stations) ? stations : [];
    } catch (err) {
      console.warn('[stationsRepository] GET /stations/liked failed:', err);
      return [];
    }
  },
};

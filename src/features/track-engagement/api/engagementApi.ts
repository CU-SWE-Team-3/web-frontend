import apiClient from '@/shared/api/client';

// ─── LIKES ────────────────────────────────────────────────────────────────────

/** POST /tracks/{id}/like  (YAML: 201 → SuccessMessage) */
export const likeTrack = async (trackId: string): Promise<void> => {
  await apiClient.post(`/tracks/${trackId}/like`, {}, { withCredentials: true });
};

/** DELETE /tracks/{id}/like  (YAML: 200 → SuccessMessage) */
export const unlikeTrack = async (trackId: string): Promise<void> => {
  await apiClient.delete(`/tracks/${trackId}/like`, { withCredentials: true });
};

/** GET /tracks/{id}/likers  (YAML: 200 → { data: { users: User[], pagination } }) */
export const getTrackLikers = async (trackId: string, page = 1, limit = 20): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/likers`, {
    params: { page, limit },
    withCredentials: true,
  });
  // YAML envelope: { success, data: { users: [...], pagination } }
  return data.data?.users ?? data.data ?? [];
};

// ─── REPOSTS ──────────────────────────────────────────────────────────────────

/** POST /tracks/{id}/repost  (YAML: 201 → { data: { reposted: true } }) */
export const repostTrack = async (trackId: string): Promise<{ reposted: boolean }> => {
  const { data } = await apiClient.post(`/tracks/${trackId}/repost`, {}, { withCredentials: true });
  return data.data ?? { reposted: true };
};

/** DELETE /tracks/{id}/repost  (YAML: 200 → { data: { reposted: false } }) */
export const unrepostTrack = async (trackId: string): Promise<{ reposted: boolean }> => {
  const { data } = await apiClient.delete(`/tracks/${trackId}/repost`, { withCredentials: true });
  return data.data ?? { reposted: false };
};

/** GET /tracks/{id}/reposters  (YAML: 200 → { data: { users: User[], pagination } }) */
export const getTrackReposters = async (trackId: string, page = 1, limit = 20): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/reposters`, {
    params: { page, limit },
    withCredentials: true,
  });
  // YAML envelope: { success, data: { users: [...], pagination } }
  return data.data?.users ?? data.data ?? [];
};

/**
 * GET /profile/{userId}/reposts  (YAML: 200 → { data: { repostedTracks: [...], pagination } })
 *
 * ⚠ PREVIOUSLY this hit /tracks/reposts?userId=... which does not exist in the YAML spec.
 *   Corrected to the real backend route.
 */
export const getUserReposts = async (userId: string, page = 1, limit = 20): Promise<any[]> => {
  const { data } = await apiClient.get(`/profile/${userId}/reposts`, {
    params: { page, limit },
    withCredentials: true,
  });
  // YAML envelope: { success, data: { repostedTracks: [...], pagination } }
  return data.data?.repostedTracks ?? data.data ?? [];
};

// ─── PLAYLISTS (no YAML endpoint — kept as-is) ───────────────────────────────

export const getTrackPlaylists = async (trackId: string): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/playlists`, { withCredentials: true });
  return data.data ?? [];
};

import apiClient from "@/shared/api/client";

// ─── LIKES ────────────────────────────────────────────────────────────────────

export interface LikeResult {
  liked: boolean;
  newLikeCount?: number;
}

export interface RepostResult {
  reposted: boolean;
  newRepostCount?: number;
}

/**
 * POST /tracks/{id}/like
 * v1.10: 201 → { success, message, data: { liked: true, newLikeCount } }
 * targetModel defaults to "Track"
 */
export const likeTrack = async (trackId: string): Promise<LikeResult> => {
  const { data } = await apiClient.post(
    `/tracks/${trackId}/like`,
    { targetModel: "Track" },
    { withCredentials: true }
  );
  return data.data ?? { liked: true };
};

/**
 * DELETE /tracks/{id}/like
 * v1.10: 200 → { success, message, data: { liked: false } }
 */
export const unlikeTrack = async (trackId: string): Promise<LikeResult> => {
  const { data } = await apiClient.delete(`/tracks/${trackId}/like`, {
    data: { targetModel: "Track" },
    withCredentials: true,
  });
  return data.data ?? { liked: false };
};

/**
 * GET /tracks/{id}/likers
 * v1.10: 200 → { success, message, data: { users: ArtistSummary[], pagination } }
 */
export const getTrackLikers = async (trackId: string, page = 1, limit = 20): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/likers`, {
    params: { page, limit },
    withCredentials: true,
  });
  return data.data?.users ?? data.data ?? [];
};

// ─── REPOSTS ──────────────────────────────────────────────────────────────────

/**
 * POST /tracks/{id}/repost
 * v1.10: 201 → { success, message, data: { reposted: true, newRepostCount } }
 */
export const repostTrack = async (trackId: string): Promise<RepostResult> => {
  const { data } = await apiClient.post(
    `/tracks/${trackId}/repost`,
    { targetModel: "Track" },
    { withCredentials: true }
  );
  return data.data ?? { reposted: true };
};

/**
 * DELETE /tracks/{id}/repost
 * v1.10: 200 → { success, message, data: { reposted: false } }
 */
export const unrepostTrack = async (trackId: string): Promise<RepostResult> => {
  const { data } = await apiClient.delete(`/tracks/${trackId}/repost`, {
    data: { targetModel: "Track" },
    withCredentials: true,
  });
  return data.data ?? { reposted: false };
};

/**
 * GET /tracks/{id}/reposters
 * v1.10: 200 → { success, message, data: { users: ArtistSummary[], pagination } }
 */
export const getTrackReposters = async (trackId: string, page = 1, limit = 20): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/reposters`, {
    params: { page, limit },
    withCredentials: true,
  });
  return data.data?.users ?? data.data ?? [];
};

/**
 * GET /profile/{userId}/reposts
 * v1.10: 200 → { success, data: { repostedTracks: [...], pagination } }
 */
export const getUserReposts = async (userId: string, page = 1, limit = 20): Promise<any[]> => {
  const { data } = await apiClient.get(`/profile/${userId}/reposts`, {
    params: { page, limit },
    withCredentials: true,
  });
  return data.data?.repostedTracks ?? data.data ?? [];
};

// ─── PLAYLISTS ────────────────────────────────────────────────────────────────

export const getTrackPlaylists = async (trackId: string): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/playlists`, { withCredentials: true });
  return data.data ?? [];
};

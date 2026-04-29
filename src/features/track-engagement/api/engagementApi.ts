import apiClient from "@/shared/api/client";
import { tracksRepository } from "@/features/tracks/api/tracksRepository";
import type { Track } from "@/features/tracks/model/track";

// ─── LIKES ────────────────────────────────────────────────────────────────────

export interface LikeResult {
  liked: boolean;
  newLikeCount?: number;
}

export interface RepostResult {
  reposted: boolean;
  newRepostCount?: number;
}

function getImageUrl(value: any): string {
  if (!value || value === "undefined" || value === "null") return "";
  if (typeof value === "string") return value;
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
    value.downloadUrl ||
    value.download_url ||
    value.url ||
    value.src ||
    ""
  );
}

function formatDuration(value: any): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
  }
  return value || value?.durationFormatted || "0:00";
}

function normaliseRepostTrack(rawTrack: any): Track {
  const artistValue = rawTrack?.artist;
  const stream = rawTrack?.streamUrl || rawTrack?.stream_url || rawTrack?.audioUrl || rawTrack?.audio_url || rawTrack?.hlsUrl || rawTrack?.hls_url || "";
  const hls = rawTrack?.hlsUrl || rawTrack?.hls_url || rawTrack?.streamUrl || rawTrack?.stream_url || rawTrack?.audioUrl || rawTrack?.audio_url || "";

  return {
    id: rawTrack?._id || rawTrack?.id || rawTrack?.targetId || "",
    _id: rawTrack?._id || rawTrack?.id,
    permalink: rawTrack?.permalink || rawTrack?._id || rawTrack?.id || "",
    title: rawTrack?.title || rawTrack?.name || "Untitled",
    artist:
      artistValue?.displayName ||
      artistValue?.username ||
      artistValue?.name ||
      artistValue?.permalink ||
      (typeof artistValue === "string" ? artistValue : "") ||
      "Unknown Artist",
    genre: rawTrack?.genre || "",
    tags: rawTrack?.tags || [],
    description: rawTrack?.description || "",
    releaseDate: rawTrack?.releaseDate || rawTrack?.release_date || "",
    visibility: rawTrack?.isPublic === false || rawTrack?.visibility === "Private" ? "Private" : "Public",
    status:
      rawTrack?.processingState === "Failed" || rawTrack?.status === "Failed"
        ? "Failed"
        : rawTrack?.processingState === "Processing" || rawTrack?.status === "Processing"
          ? "Processing"
          : "Finished",
    audioFileName: rawTrack?.audioFileName || rawTrack?.fileName || "",
    artworkUrl: getImageUrl(rawTrack?.artworkUrl || rawTrack?.artwork_url || rawTrack?.artwork || rawTrack?.coverUrl || rawTrack?.cover_url || rawTrack?.imageUrl || rawTrack?.image_url || rawTrack?.thumbnailUrl || rawTrack?.thumbnail_url),
    waveform: rawTrack?.waveform || [],
    duration: formatDuration(rawTrack?.duration ?? rawTrack?.durationFormatted),
    createdAt: rawTrack?.createdAt || rawTrack?.created_at || "",
    updatedAt: rawTrack?.updatedAt || rawTrack?.updated_at || "",
    streamUrl: stream,
    hlsUrl: hls,
    playCount: rawTrack?.playCount ?? rawTrack?.play_count ?? 0,
    likeCount: rawTrack?.likeCount ?? rawTrack?.like_count ?? 0,
    repostCount: rawTrack?.repostCount ?? rawTrack?.repost_count ?? 0,
    commentCount: rawTrack?.commentCount ?? rawTrack?.comment_count ?? 0,
  };
}

async function normaliseRepostItem(rawItem: any): Promise<any> {
  const rawTrack = rawItem?.target || rawItem?.track || rawItem;
  let track = normaliseRepostTrack(rawTrack);

  if (track.id && (!track.artworkUrl || (!track.streamUrl && !track.hlsUrl))) {
    try {
      const fullTrack = await tracksRepository.getTrackById(track.permalink || track.id);
      track = {
        ...track,
        ...fullTrack,
        id: fullTrack.id || track.id,
        _id: fullTrack._id || track._id,
        permalink: fullTrack.permalink || track.permalink,
      };
    } catch {
      // Keep the summary track if the single-track endpoint is unavailable.
    }
  }

  return {
    ...rawItem,
    repostDate: rawItem?.repostDate || rawItem?.repostedAt || rawItem?.createdAt || track.createdAt || "",
    targetModel: rawItem?.targetModel || "Track",
    target: track,
    track,
  };
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
  const rawReposts = data.data?.repostedTracks ?? data.data ?? [];
  if (!Array.isArray(rawReposts)) return [];
  return Promise.all(rawReposts.map(normaliseRepostItem));
};

// ─── PLAYLISTS ────────────────────────────────────────────────────────────────

export const getTrackPlaylists = async (trackId: string): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/playlists`, { withCredentials: true });
  return data.data ?? [];
};

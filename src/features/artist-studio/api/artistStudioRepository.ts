import apiClient from "@/shared/api/client";
import { tracksRepository } from "@/features/tracks/api/tracksRepository";
import type { Track } from "@/features/tracks/model/track";

export interface ArtistStudioTrack extends Track {
  commentsTotal: number;
  repostsTotal: number;
  downloadsTotal: number;
}

export interface ArtistStudioSummary {
  tracks: ArtistStudioTrack[];
  totals: {
    tracks: number;
    plays: number;
    reposts: number;
    downloads: number;
    comments: number;
  };
}

function readCount(value: any): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function firstCount(...values: any[]): number {
  for (const value of values) {
    const count = readCount(value);
    if (count !== null) return count;
  }
  return 0;
}

async function getCommentCount(trackId: string, fallback: number): Promise<number> {
  if (fallback > 0) return fallback;

  try {
    const { data } = await apiClient.get(`/tracks/${trackId}/comments`, {
      params: { page: 1, limit: 1 },
      withCredentials: true,
    });

    return firstCount(
      data?.total,
      data?.count,
      data?.data?.total,
      data?.data?.count,
      data?.data?.pagination?.total,
      data?.pagination?.total,
      Array.isArray(data?.data?.comments) ? data.data.comments.length : null,
    );
  } catch {
    return fallback;
  }
}

async function getRepostCount(trackId: string, fallback: number): Promise<number> {
  if (fallback > 0) return fallback;

  try {
    const { data } = await apiClient.get(`/tracks/${trackId}/reposters`, {
      params: { page: 1, limit: 1 },
      withCredentials: true,
    });

    return firstCount(
      data?.total,
      data?.count,
      data?.data?.total,
      data?.data?.count,
      data?.data?.pagination?.total,
      data?.pagination?.total,
      Array.isArray(data?.data?.users) ? data.data.users.length : null,
    );
  } catch {
    return fallback;
  }
}

async function enrichTrack(track: Track): Promise<ArtistStudioTrack> {
  const trackId = track.id || track._id || "";
  const commentsFallback = firstCount(track.commentCount);
  const repostsFallback = firstCount(track.repostCount);
  const downloadsFallback = firstCount(track.downloadCount, (track as any).downloads);

  const [commentsTotal, repostsTotal] = trackId
    ? await Promise.all([
        getCommentCount(trackId, commentsFallback),
        getRepostCount(trackId, repostsFallback),
      ])
    : [commentsFallback, repostsFallback];

  return {
    ...track,
    commentsTotal,
    repostsTotal,
    downloadsTotal: downloadsFallback,
  };
}

export const artistStudioRepository = {
  async getSummary(): Promise<ArtistStudioSummary> {
    const tracks = await tracksRepository.getTracks();
    const studioTracks = await Promise.all(tracks.map(enrichTrack));

    return {
      tracks: studioTracks,
      totals: {
        tracks: studioTracks.length,
        plays: studioTracks.reduce((sum, track) => sum + firstCount(track.playCount), 0),
        reposts: studioTracks.reduce((sum, track) => sum + track.repostsTotal, 0),
        downloads: studioTracks.reduce((sum, track) => sum + track.downloadsTotal, 0),
        comments: studioTracks.reduce((sum, track) => sum + track.commentsTotal, 0),
      },
    };
  },
};

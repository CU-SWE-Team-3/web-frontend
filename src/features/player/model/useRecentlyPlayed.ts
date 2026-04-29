import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import type { Track } from "./playerStore";

// Based on HistoryRecord schema in YAML
export interface HistoryRecord {
  id: string;
  track: Track;
  progressSeconds: number;
  lastPlayedAt: string;
}

export const RECENTLY_PLAYED_QUERY_KEY = ["recently-played"] as const;

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

function mapHistoryRecord(record: any): HistoryRecord | null {
  const rawTrack = record?.track || record?.target || record;
  const trackId =
    (typeof rawTrack === "string" ? rawTrack : rawTrack?._id || rawTrack?.id) ||
    record?.trackId ||
    record?.track_id ||
    "";

  if (!trackId) return null;

  const artist = rawTrack?.artist;
  const track: Track = {
    id: trackId,
    title: rawTrack?.title || rawTrack?.name || "Untitled",
    artist:
      artist?.displayName ||
      artist?.username ||
      artist?.permalink ||
      artist?.name ||
      (typeof artist === "string" ? artist : "") ||
      "Unknown Artist",
    artworkUrl: getImageUrl(rawTrack?.artworkUrl || rawTrack?.artwork_url || rawTrack?.artwork || rawTrack?.coverUrl || rawTrack?.cover_url || rawTrack?.imageUrl || rawTrack?.image_url),
    duration: Number(rawTrack?.duration) || 0,
    hlsUrl: rawTrack?.hlsUrl || rawTrack?.hls_url || rawTrack?.streamUrl || rawTrack?.stream_url || rawTrack?.audioUrl || rawTrack?.audio_url || "",
    streamUrl: rawTrack?.streamUrl || rawTrack?.stream_url || rawTrack?.hlsUrl || rawTrack?.hls_url || rawTrack?.audioUrl || rawTrack?.audio_url || "",
    genre: rawTrack?.genre || "",
  };

  const playedAt = record?.playedAt || record?.lastPlayedAt || record?.createdAt || new Date().toISOString();

  return {
    id: record?._id || record?.id || `${trackId}-${playedAt}`,
    track,
    progressSeconds: Number(record?.progress ?? record?.progressSeconds ?? record?.durationPlayed ?? 0),
    lastPlayedAt: playedAt,
  };
}

export const useRecentlyPlayed = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return useQuery<HistoryRecord[], Error>({
    queryKey: RECENTLY_PLAYED_QUERY_KEY,
    queryFn: async (): Promise<HistoryRecord[]> => {
      try {
        const { data } = await apiClient.get("/history/recently-played");
        const records = Array.isArray(data?.data?.recentlyPlayed)
          ? data.data.recentlyPlayed
          : Array.isArray(data?.recentlyPlayed)
            ? data.recentlyPlayed
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];

        if (!Array.isArray(records)) return [];
        return records.map(mapHistoryRecord).filter((record): record is HistoryRecord => record !== null);
      } catch (err) {
        console.error('Failed to fetch recently played tracks:', err);
        return [];
      }
    },
    enabled: isInitialized && isAuthenticated,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

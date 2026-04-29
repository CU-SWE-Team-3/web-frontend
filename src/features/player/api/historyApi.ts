import apiClient from "@/shared/api/client";
import type { HistoryEntry } from "../model/historyStore";
import type { Track } from "../model/playerStore";

export const historyApi = {
  /**
   * GET /history/recently-played
   * v1.10 envelope: { success, results, page, data: { recentlyPlayed: ListenHistoryRecord[] } }
   * ListenHistoryRecord: { _id, track: TrackSummary, playlist?, progress, playedAt }
   */
  async getRecentlyPlayed(page = 1, limit = 20): Promise<{ recentlyPlayed: HistoryEntry[] }> {
    const response = await apiClient.get('/history/recently-played', { params: { page, limit } });
    const records = response.data?.data?.recentlyPlayed || [];

    const mapped = records.map((record: any) => {
      const t = record.track || {};
      const track: Track = {
        id: t._id || t.id,
        title: t.title || 'Untitled',
        artist: t.artist?.displayName || t.artist?.permalink || t.artist?.username || 'Unknown',
        artworkUrl: t.artworkUrl || "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=420&h=420&fit=crop",
        duration: t.duration || 0,
        hlsUrl: t.hlsUrl || '',
        streamUrl: t.streamUrl || t.hlsUrl || '',
        genre: t.genre || '',
      };

      return {
        id: record._id || `${track.id}-${Date.now()}`,
        track: track,
        playedAt: record.playedAt || new Date().toISOString(),
        durationPlayed: record.progress || 0,
      } as HistoryEntry;
    });

    return { recentlyPlayed: mapped };
  },

  /**
   * POST /history/progress
   * v1.10 body: { trackId, progress, playlistId? }
   * Upserts a listen history record and updates playCount when progress >= 90%.
   */
  async recordProgress(trackId: string, progress: number, playlistId?: string): Promise<void> {
    await apiClient.post('/history/progress', {
      trackId,
      progress,
      ...(playlistId ? { playlistId } : {}),
    });
  },

  /**
   * DELETE /history
   * v1.10: Permanently clears all listening history for the authenticated user.
   */
  async clearHistory(): Promise<void> {
    await apiClient.delete('/history');
  },

  /**
   * GET /player/{id}/stream
   * v1.10: 200 → { status: "success", data: { streamUrl, duration, format, previewStartTime, previewEndTime } }
   * Returns the HLS manifest URL for the given track ID.
   * Requires authentication.
   */
  async getStreamUrl(trackId: string): Promise<{
    streamUrl: string;
    duration: number;
    format: string;
    previewStartTime: number;
    previewEndTime: number;
  }> {
    const response = await apiClient.get(`/player/${trackId}/stream`);
    return response.data?.data ?? { streamUrl: '', duration: 0, format: 'audio/mpeg', previewStartTime: 0, previewEndTime: 20 };
  },
};

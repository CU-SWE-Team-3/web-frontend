import apiClient from "@/shared/api/client";
import type { HistoryEntry } from "../model/historyStore";
import type { Track } from "../model/playerStore";

export const historyApi = {
  async getRecentlyPlayed(page = 1, limit = 20): Promise<{ recentlyPlayed: HistoryEntry[] }> {
    const response = await apiClient.get('/history/recently-played', { params: { page, limit } });
    const records = response.data?.data?.recentlyPlayed || [];
    
    // Map backend history records to our HistoryEntry format
    const mapped = records.map((record: any) => {
      const t = record.track || {};
      const track: Track = {
        id: t._id || t.id,
        title: t.title || 'Untitled',
        artist: t.artist?.displayName || t.artist?.username || 'Unknown',
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

  async recordProgress(trackId: string, progress: number): Promise<void> {
    await apiClient.post('/history/progress', { trackId, progress });
  }
};

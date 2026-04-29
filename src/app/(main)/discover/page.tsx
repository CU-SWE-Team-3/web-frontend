'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { TrendingByGenre } from '@/features/trending';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useHistoryStore } from '@/features/player/model/historyStore';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import apiClient from '@/shared/api/client';
import { RecentlyPlayed } from '@/features/player/ui/history/RecentlyPlayed';
import Link from 'next/link';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [suggestedArtists, setSuggestedArtists] = React.useState<any[]>([]);
  const { data: likedTracksList } = useLikedTracks();
  const { recentlyPlayed, clearRecent } = useHistoryStore();
  const play = usePlayerStore(s => s.play);

  React.useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await apiClient.get('/network/suggested');
        if (res.data.success) setSuggestedArtists(res.data.data || []);
      } catch (err) { console.warn('Failed to fetch suggestions:', err); }
    }
    fetchSuggestions();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className="max-w-[1240px] mx-auto px-6 py-10 flex gap-10">
        {/* Main Column */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[24px] font-bold text-white mb-2">Discover</h2>
          <p className="text-[#999] text-sm mb-6">Explore the best of BioBeats.</p>
          <TrendingByGenre />
        </div>

        {/* Sidebar */}
        <aside className="w-[300px] flex-shrink-0 flex flex-col gap-10">
          {/* History */}
          {recentlyPlayed.length > 0 && (
            <div>
              <RecentlyPlayed tracks={recentlyPlayed} onPlay={play} onClear={clearRecent} />
            </div>
          )}

          {/* Suggested Artists */}
          <div>
            <h3 className="text-[12px] font-bold text-[#555] uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
              Who to follow
            </h3>
            <div className="flex flex-col gap-4">
              {suggestedArtists.slice(0, 3).map(artist => (
                <div key={artist._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#333] overflow-hidden">
                    <img src={artist.avatarUrl || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${artist.permalink || artist._id}`} className="text-[13px] font-medium hover:underline block truncate">{artist.displayName}</Link>
                    <p className="text-[11px] text-[#777]">{fmt(artist.followerCount || 0)} followers</p>
                  </div>
                  <button className="px-3 py-1 bg-white text-black text-[11px] font-bold rounded hover:bg-gray-200">Follow</button>
                </div>
              ))}
            </div>
          </div>

          {/* Likes */}
          {likedTracksList && likedTracksList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="text-[12px] font-bold text-[#555] uppercase tracking-widest">Likes</h3>
                <Link href="/likes" className="text-[11px] text-[#777] hover:text-white">View all</Link>
              </div>
              <div className="flex flex-col gap-3">
                {likedTracksList.slice(0, 3).map(track => (
                  <div key={track.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => play({ ...track, streamUrl: track.hlsUrl } as any)}>
                    <div className="w-10 h-10 bg-[#333] rounded overflow-hidden relative">
                      <img src={track.artworkUrl || ''} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{track.title}</p>
                      <p className="text-[11px] text-[#777] truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

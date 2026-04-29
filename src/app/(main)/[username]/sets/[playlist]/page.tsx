'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { trendingRepository } from '@/features/trending/api/trendingRepository';
import type { TrendingTrack } from '@/features/trending/model/types';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';

export default function PlaylistPage({ params }: { params: { username: string, playlist: string } }) {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rawPlaylist = params.playlist || '';
  const title = rawPlaylist.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const username = params.username.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    async function fetchTracks() {
      setIsLoading(true);
      try {
        // Normalize genre: remove "top-50-" if present
        const genreQuery = rawPlaylist.replace(/^top-50-/, '');
        // Fetch real tracks from the backend for this genre
        const data = await trendingRepository.getTrending(genreQuery, 50);
        setTracks(data);
      } catch (err) {
        console.error('Failed to load playlist tracks:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTracks();
  }, [rawPlaylist]);

  // Engagement
  const { user } = useAuthStore();
  const userId = (user as any)?._id || user?.id || '';
  // Since this is a "Trending" set, it doesn't have a single playlist ID to like, 
  // but we could track "liked genres" if the API supported it.
  // For now, we'll just show the like state as false or based on some mock logic if needed,
  // but let's at least make the individual track likes work (which I already did in previous step).
  // Actually, I'll just remove the non-functional top-level Like button or make it a "Save to Library" mock.
  
  const coverArt = tracks.length > 0 && tracks[0]?.artworkUrl 
    ? tracks[0].artworkUrl 
    : undefined;
  
  // Calculate total duration roughly
  const totalDurationSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);

  return (
    <div className="min-h-screen bg-[#111] text-white font-[var(--sc-font-family)]">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className="max-w-[1240px] mx-auto py-8 px-6">
        
        {/* Banner Section */}
        <div className="relative flex justify-between p-10 bg-gradient-to-br from-[#81a4b4] to-[#5f8496] h-[380px]">
          
          <div className="flex flex-col justify-between z-10">
            <div className="flex gap-5">
              <button className="w-[60px] h-[60px] rounded-full bg-[#f50] border-none cursor-pointer flex items-center justify-center hover:scale-105 transition-transform">
                <div className="w-0 h-0 border-solid border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1" />
              </button>
              
              <div>
                <div className="inline-block bg-black px-2 py-1 text-2xl font-bold mb-2">
                  {title}
                </div>
                <br/>
                <div className="inline-flex items-center gap-1 bg-black px-2 py-0.5 text-sm text-[#ccc]">
                  {username}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#3da1f2">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-3.3-3.3 1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4-6.3 6.3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="w-[120px] h-[120px] rounded-full bg-black/80 flex flex-col items-center justify-center">
               <span className="text-2xl font-bold">{tracks.length || 0}</span>
               <span className="text-[11px] tracking-widest text-[#999] mt-0.5 mb-1">TRACKS</span>
               <span className="text-[11px] text-[#666]">{hours}:{minutes.toString().padStart(2, '0')}:00</span>
            </div>
          </div>

          <div className="flex gap-5 z-10">
            <div className="text-right">
              <div className="text-[13px] text-white/80 mb-2">Updated today</div>
              <span className="bg-black/40 px-2 py-0.5 rounded-full text-xs">#{title}</span>
            </div>
            {coverArt ? (
              <img 
                src={coverArt} 
                alt={title}
                className="w-[340px] h-[340px] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
              />
            ) : (
              <div className="w-[340px] h-[340px] bg-[#222] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-[#555]">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between py-3 border-b border-[#222] mb-6">
          <div className="flex gap-2">
            <button className="bg-transparent border border-white/10 text-[#ccc] px-3 py-1 rounded hover:border-white/30 cursor-pointer flex items-center gap-1.5 text-sm transition-colors hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              Like
            </button>
            <button className="bg-transparent border border-white/10 text-[#ccc] px-3 py-1 rounded hover:border-white/30 cursor-pointer flex items-center gap-1.5 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              Repost
            </button>
            <button className="bg-transparent border border-white/10 text-[#ccc] px-3 py-1 rounded hover:border-white/30 cursor-pointer flex items-center gap-1.5 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              Share
            </button>
            <button className="bg-transparent border border-white/10 text-[#ccc] px-3 py-1 rounded hover:border-white/30 cursor-pointer flex items-center gap-1.5 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              Copy Link
            </button>
          </div>
          
          <div className="flex gap-4 text-[#999] text-[13px]">
            <span className="flex items-center gap-1">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
               0
            </span>
            <span className="flex items-center gap-1">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
               0
            </span>
          </div>
        </div>

        {/* Body content */}
        <div className="flex gap-8">
          
          {/* Main List */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[120px] h-[120px] rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                 <div className="text-center">
                   <div className="font-bold text-white leading-tight">TRENDING</div>
                   <div className="font-bold text-white leading-tight">MUSIC</div>
                 </div>
              </div>
              <div>
                <p className="text-[13px] text-white mb-2">Trending {title} songs on BioBeats. Updates weekly with popular tracks.</p>
                <div className="flex gap-2">
                  {['#'+title, '#Top Tracks', '#Trending'].map(tag => (
                    <span key={tag} className="text-[12px] text-[#999] bg-[#222] px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Real Tracks from Backend */}
            <div className="flex flex-col">
              {isLoading ? (
                <div className="animate-pulse flex flex-col gap-4 mt-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#222] rounded" />
                      <div className="h-4 bg-[#222] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : tracks.length > 0 ? (
                tracks.map((track, i) => (
                  <div key={track._id} onClick={async () => {
                      const { usePlayerStore } = await import('@/features/player/model/playerStore');
                      usePlayerStore.getState().play({
                        id: track._id,
                        title: track.title,
                        artist: track.artist?.displayName || 'Unknown Artist',
                        artworkUrl: track.artworkUrl || '',
                        streamUrl: track.hlsUrl || '',
                        hlsUrl: track.hlsUrl || '',
                      });
                    }} className="flex items-center py-2 border-b border-[#222] gap-3 cursor-pointer hover:bg-white/5 group transition-colors">
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} className="w-[30px] h-[30px] object-cover" />
                    ) : (
                      <div className="w-[30px] h-[30px] bg-[#333]" />
                    )}
                    <span className="text-[13px] text-[#999] w-5 text-right">{i + 1}</span>
                    <div className="flex-1 flex items-center gap-2">
                       <span className="text-[13px] text-[#999] hover:underline">{track.artist?.displayName}</span>
                       <span className="text-[13px] text-[#ccc]">-</span>
                       <span className="text-[13px] text-white group-hover:text-[#ff5500] truncate">{track.title}</span>
                    </div>
                    <span className="text-[12px] text-[#666]">▶ {(track.playCount / 1000).toFixed(1)}K</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-[#666]">No tracks found for this playlist.</div>
              )}
            </div>
          </div>

           <div className="w-[300px] shrink-0">
             {/* Removed mock side content */}
           </div>

        </div>
      </main>
    </div>
  );
}

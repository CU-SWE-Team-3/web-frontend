'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import { useHistoryStore } from '@/features/player/model/historyStore';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { SquareTrackCard } from '@/shared/ui/SquareTrackCard/SquareTrackCard';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // History & Player
  const listeningHistory = useHistoryStore((st) => st.listeningHistory);
  const play = usePlayerStore((st) => st.play);

  // Liked tracks
  const { data: likedTracksList } = useLikedTracks();

  // Deduplicate and get recently played tracks
  const recentlyPlayed = listeningHistory.slice(0, 10).map((entry) => entry.track);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Suggested Artists
        const suggestRes = await apiClient.get(`/network/suggested`, { withCredentials: true });
        if (suggestRes.data.success) {
          const arr = suggestRes.data.data || [];
          setSuggestedArtists(arr);
          const folMap: Record<string, boolean> = {};
          arr.forEach((a: any) => (folMap[a._id] = false));
          setFollowingMap(folMap);
        }
      } catch (err) {
        console.warn('Failed to fetch suggested artists:', err);
      }
    }
    fetchData();
  }, []);

  const handleFollowToggle = async (artistId: string) => {
    if (!isAuthenticated) return;
    const currentlyFollowing = followingMap[artistId];
    setFollowingMap((prev) => ({ ...prev, [artistId]: !currentlyFollowing }));

    try {
      if (currentlyFollowing) {
        await apiClient.delete(`/network/${artistId}/follow`, { withCredentials: true });
      } else {
        await apiClient.post(`/network/${artistId}/follow`, {}, { withCredentials: true });
      }
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      console.warn('Follow action failed:', err);
      setFollowingMap((prev) => ({ ...prev, [artistId]: currentlyFollowing }));
    }
  };

  const handlePlayTrack = (trackNode: any) => {
    const track = {
      id: trackNode.id || trackNode._id,
      title: trackNode.title,
      artist: trackNode.artist?.displayName || trackNode.artist || 'Unknown',
      artworkUrl: trackNode.artworkUrl || null,
      hlsUrl: trackNode.hlsUrl || '',
      duration: trackNode.duration || 0,
    };
    play(track);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'var(--sc-font-family)' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main data-testid="home-page" style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32 }}>
        {/* ─── Main Feed (Left Column) ─── */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
          
          {/* More of what you like */}
          <section className="mb-12">
            <h2 className="text-[24px] font-bold text-white mb-6">More of what you like</h2>
            {likedTracksList && likedTracksList.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {likedTracksList.map((track) => (
                  <SquareTrackCard 
                    key={track.id}
                    id={track.id}
                    title={track.title}
                    artist={track.artist}
                    artworkUrl={track.artworkUrl}
                    onPlay={() => handlePlayTrack(track)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[#888] text-[14px]">You haven't liked any tracks recently to show here.</p>
            )}
          </section>

          {/* Recently Played */}
          <section className="mb-12">
            <h2 className="text-[24px] font-bold text-white mb-6">Recently Played</h2>
            {recentlyPlayed && recentlyPlayed.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {recentlyPlayed.map((track) => (
                  <SquareTrackCard 
                    key={track.id}
                    id={track.id}
                    title={track.title}
                    artist={track.artist}
                    artworkUrl={track.artworkUrl}
                    onPlay={() => handlePlayTrack(track)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[#888] text-[14px]">Your recent listening history will appear here.</p>
            )}
          </section>
        </div>

        {/* ─── Sidebar (Right Column) ─── */}
        <aside style={{ width: 340, flexShrink: 0 }}>
          
          {/* Artist Tools Card */}
          <div className="bg-[#1a1a1a] rounded-sm mb-8" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="border-b border-[#333] p-4 flex justify-between items-center cursor-pointer hover:bg-[#222]">
              <h3 className="text-[12px] font-bold text-[#ccc] tracking-wider uppercase">Artist Tools</h3>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div className="p-4 bg-[#111]">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {/* Amplify */}
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#ff5500] text-[10px]">✦</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Amplify</span>
                </div>
                {/* Replace */}
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#a53bba] text-[10px]">✦</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 21l6-6M9 8L3 2M3 21l6-6"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Replace</span>
                </div>
                {/* Distribute */}
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#a53bba] text-[10px]">✦</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Distribute</span>
                </div>
                {/* Master */}
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#a53bba] text-[10px]">✦</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Master</span>
                </div>
              </div>
              <button className="w-full bg-[#352554] hover:bg-[#432d69] text-[#e5d9f2] text-[13px] font-medium py-3 rounded-sm flex items-center justify-center gap-2 transition-colors">
                <span className="bg-[#59408b] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">✦</span>
                Unlock Artist tools from EGP 29.99/month.
              </button>
            </div>
          </div>

          {/* Artists You Should Follow */}
          <div className="mb-8">
            <div className="flex items-end justify-between border-b border-[#333] pb-2 mb-4">
              <h3 className="text-[12px] font-bold text-[#ccc] uppercase tracking-wider">Artists you should follow</h3>
              <button className="text-[12px] text-[#999] hover:text-[#ccc]">Refresh list</button>
            </div>

            <div className="flex flex-col gap-4">
              {suggestedArtists.slice(0, 3).map((artist: any) => {
                const isFol = followingMap[artist._id];
                return (
                  <div key={artist._id} className="flex items-center gap-3">
                    <Link href={ROUTES.PROFILE(artist.permalink || artist._id)}>
                      <div className="w-[50px] h-[50px] rounded-full bg-[#333] overflow-hidden shrink-0">
                        <img
                          src={artist.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
                          alt={artist.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 min-w-0">
                      <Link href={ROUTES.PROFILE(artist.permalink || artist._id)} className="text-[14px] text-white font-medium truncate hover:text-[#ccc]">
                        {artist.displayName}
                      </Link>
                      <div className="flex items-center gap-2 text-[12px] text-[#999] mt-0.5">
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          {fmt(artist.followerCount || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg>
                          {fmt(artist.trackCount || 0)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollowToggle(artist._id)}
                      className={`px-3 py-1 rounded text-[12px] font-medium border transition-colors ${
                        isFol 
                          ? 'border-[#ff5500] text-[#ff5500] bg-transparent hover:bg-[#ff5500]/10' 
                          : 'bg-white border-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {isFol ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Likes List Sidebar */}
          <div>
            <div className="flex items-end justify-between border-b border-[#333] pb-2 mb-4">
              <h3 className="text-[12px] font-bold text-[#ccc] uppercase tracking-wider">
                {likedTracksList?.length ? `${likedTracksList.length} ` : ''}LIKES
              </h3>
              <Link href={ROUTES.LIBRARY_LIKES} className="text-[12px] text-[#999] hover:text-[#ccc]">
                View all
              </Link>
            </div>
            
            <div className="flex flex-col">
              {likedTracksList?.slice(0, 3).map((track: any) => (
                <div key={track.id} className="flex items-center gap-3 py-2 cursor-pointer group" onClick={() => handlePlayTrack(track)}>
                  <div className="w-12 h-12 bg-[#333] rounded-sm overflow-hidden shrink-0 relative">
                    <img src={track.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop'} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center transition-opacity">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="6,4 20,12 6,20"/></svg>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] text-[#999] truncate">{track.artist}</span>
                    <span className="text-[13px] text-white font-medium truncate group-hover:text-[#ccc]">{track.title}</span>
                    <div className="flex gap-2 text-[11px] text-[#555] mt-1">
                      <span>▶ {fmt(track.playCount || 0)}</span>
                      <span>♥ {fmt(track.likeCount || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}} />
    </div>
  );
}

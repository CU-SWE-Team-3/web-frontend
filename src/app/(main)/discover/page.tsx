'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { useEditorial, useMixedForYou, useMoreOfWhatYouLike, useSuggestedArtists, useGenreStation } from '@/features/trending/model/trendingQueries';
import { getStationHref } from '@/features/trending/lib/stationLinks';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const play = usePlayerStore((st) => st.play);

  // Liked tracks
  const { data: likedTracksList } = useLikedTracks();

  const { data: mixedData, isLoading: isMixedLoading } = useMixedForYou();
  const { data: moreOfWhatYouLike, isLoading: isMoreLoading } = useMoreOfWhatYouLike();
  const { data: curatedBuckets, isLoading: isCuratedLoading } = useEditorial();
  const { data: userSuggestions, isLoading: isSuggestLoading } = useSuggestedArtists();

  // Genre-specific trending sections — use /discovery/genre/{genre} (correct API endpoint)
  const { data: trendingHiphop, isLoading: isHiphopLoading } = useGenreStation('Hiphop & rap');
  const { data: trendingElectronic, isLoading: isElectronicLoading } = useGenreStation('Electronic');
  const { data: trendingPop, isLoading: isPopLoading } = useGenreStation('Pop');

  const moreLikeStation = moreOfWhatYouLike?.length ? {
    id: 'more-of-what-you-like',
    title: 'More of what you like',
    description: 'A station based on tracks you already like',
    artworkUrl: moreOfWhatYouLike[0]?.artworkUrl,
    tracks: moreOfWhatYouLike,
  } : null;

  const genreStations = [
    {
      id: 'genre-electronic',
      title: 'Electronic',
      description: 'Trending Music',
      artworkUrl: trendingElectronic?.[0]?.artworkUrl,
      tracks: trendingElectronic,
      isLoading: isElectronicLoading,
    },
    {
      id: 'genre-hiphop-rap',
      title: 'Hip-hop & Rap',
      description: 'Trending Music',
      artworkUrl: trendingHiphop?.[0]?.artworkUrl,
      tracks: trendingHiphop,
      isLoading: isHiphopLoading,
    },
    {
      id: 'genre-pop',
      title: 'Pop',
      description: 'Trending Music',
      artworkUrl: trendingPop?.[0]?.artworkUrl,
      tracks: trendingPop,
      isLoading: isPopLoading,
    },
  ].filter((station) => (station.tracks?.length ?? 0) > 0);

  useEffect(() => {
    // Sync local state with suggest query if needed
    if (userSuggestions) {
      setSuggestedArtists(userSuggestions);
      const folMap: Record<string, boolean> = {};
      userSuggestions.forEach((a: any) => (folMap[a._id] = false));
      setFollowingMap(folMap);
    }
  }, [userSuggestions]);

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
      queryClient.invalidateQueries({ queryKey: ['suggested-artists'] });
    } catch (err) {
      console.warn('Follow action failed:', err);
      setFollowingMap((prev) => ({ ...prev, [artistId]: currentlyFollowing }));
    }
  };

  const handlePlayTrack = async (trackNode: any) => {
    let streamUrl = trackNode.hlsUrl || trackNode.streamUrl || '';
    
    // Discovery tracks (TrendingTrack) do NOT include hlsUrl in the API response.
    // Must call /player/{id}/stream to get the actual HLS stream URL.
    if (!streamUrl) {
      const trackId = trackNode._id || trackNode.id;
      try {
        const { data: streamData } = await apiClient.get(`/player/${trackId}/stream`);
        streamUrl = streamData?.data?.streamUrl ?? streamData?.data?.hlsUrl ?? '';
      } catch (err) {
        console.warn('Could not fetch stream URL for playback:', err);
      }
    }

    const track = {
      id: trackNode._id || trackNode.id,
      title: trackNode.title,
      artist: trackNode.artist?.displayName || trackNode.artist || 'Unknown',
      artworkUrl: trackNode.artworkUrl || null,
      hlsUrl: streamUrl,
      streamUrl: streamUrl,
      waveform: trackNode.waveform || [],
      duration: trackNode.duration || 0,
    };
    play(track as any);
  };

  const handlePlayBucket = async (bucket: any) => {
    if (!bucket || !bucket.tracks || bucket.tracks.length === 0) return;
    // Play the first track immediately via the stream endpoint
    const firstTrack = bucket.tracks[0];
    await handlePlayTrack(firstTrack);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main data-testid="discover-page" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* ─── Main Feed (Left Column) ─── */}
        <div className="flex-1 min-w-0">
          
          {/* Mixed for You */}
          {mixedData && mixedData.length > 0 && (
            <DiscoverSection 
              title={`Mixed for ${useAuthStore.getState().user?.displayName || 'you'}`} 
              isLoading={isMixedLoading}
            >
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                {mixedData.map((mix: any, i: number) => (
                  <MixCard
                    key={mix.id || mix._id || i}
                    index={i + 1}
                    mix={mix}
                    href={getStationHref(mix, i, 'mix')}
                    onPlay={() => handlePlayBucket(mix)}
                  />
                ))}
              </div>
            </DiscoverSection>
          )}

          {moreLikeStation && (
            <DiscoverSection title="More of what you like" isLoading={isMoreLoading}>
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                <StationCard
                  station={moreLikeStation}
                  href={getStationHref(moreLikeStation, 0, 'station')}
                  onPlay={() => handlePlayBucket(moreLikeStation)}
                />
              </div>
            </DiscoverSection>
          )}

          {(curatedBuckets && curatedBuckets.length > 0) && (
            <DiscoverSection title="Made for you">
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                {curatedBuckets.filter((bucket: any) => bucket.tracks?.length).map((bucket: any, bucketIndex: number) => (
                  <StationCard
                    key={bucket.id || bucket._id || bucketIndex}
                    station={bucket}
                    href={getStationHref(bucket, bucketIndex, 'set')}
                    onPlay={() => handlePlayBucket(bucket)}
                  />
                ))}
              </div>
            </DiscoverSection>
          )}

          {isCuratedLoading && (
            <DiscoverSection title="Made for you" isLoading={true}>
              <div />
            </DiscoverSection>
          )}

          {genreStations.length > 0 && (
            <DiscoverSection title="Trending by genre" isLoading={isHiphopLoading || isElectronicLoading || isPopLoading}>
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                {genreStations.map((station, stationIndex) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    href={getStationHref(station, stationIndex, 'station')}
                    onPlay={() => handlePlayBucket(station)}
                  />
                ))}
              </div>
            </DiscoverSection>
          )}

          {/* New crew, suggested for you */}
          <DiscoverSection title="New crew, suggested for you" isLoading={isSuggestLoading}>
            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar items-start">
              {suggestedArtists.length ? suggestedArtists.map((artist) => (
                <ArtistCard 
                  key={artist._id} 
                  artist={artist} 
                  isFollowing={followingMap[artist._id]}
                  onToggle={() => handleFollowToggle(artist._id)}
                />
              )) : (
                <p className="text-[#666] text-[13px] py-4">No suggestions available right now.</p>
              )}
            </div>
          </DiscoverSection>

        </div>

        {/* ─── Sidebar (Right Column) ─── */}
        <aside className="w-full lg:w-[340px] flex-shrink-0">
          
          {false && (
            <>
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

            </>
          )}

          {/* Artists You Should Follow */}
          <div className="mb-8">
            <div className="flex items-end justify-between border-b border-[#333] pb-2 mb-4">
              <h3 className="text-[12px] font-bold text-[#ccc] uppercase tracking-wider">Artists you should follow</h3>
              <button className="text-[12px] text-[#999] hover:text-[#ccc]">Refresh list</button>
            </div>

            <div className="flex flex-col gap-5">
              {suggestedArtists.slice(0, 3).map((artist: any) => {
                const isFol = followingMap[artist._id];
                return (
                  <div key={artist._id} className="flex items-center gap-3">
                    <Link href={ROUTES.PROFILE(artist.permalink || artist._id)}>
                      <div className="w-[50px] h-[50px] rounded-full bg-[#333] overflow-hidden shrink-0 border border-white/5">
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
                      <div className="flex items-center gap-2 text-[11px] text-[#999] mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          {fmt(artist.followerCount || 0)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                          {fmt(artist.trackCount || 0)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollowToggle(artist._id)}
                      className={`px-3 py-1 rounded-sm text-[12px] font-medium border transition-colors ${
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
          <div className="mb-8">
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
                <SidebarTrackRow key={track.id || track._id} track={track} onPlay={() => handlePlayTrack(track)} />
              ))}
            </div>
          </div>

          {/* Footer Sidebar */}
          <div className="text-[11px] text-[#999] pt-2 border-t border-[#333]">
            <div className="flex flex-wrap gap-x-2 gap-y-1 mb-4 leading-tight">
              <Link href="#" className="hover:text-[#ccc]">Legal</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Privacy</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Cookie Policy</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Cookie Manager</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Imprint</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Artist Resources</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Newsroom</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Charts</Link><span>-</span>
              <Link href="#" className="hover:text-[#ccc]">Transparency Reports</Link>
            </div>
            <div className="font-medium text-[#ccc]">
              Language: <span className="text-[#3882d9] cursor-pointer hover:underline font-normal">English (US)</span>
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

// ─── Internal Components ──────────────────────────────────────────────────────

function DiscoverSection({ title, children, isLoading, hideIfEmpty = true, viewAllHref }: { title: string, children: React.ReactNode, isLoading?: boolean, hideIfEmpty?: boolean, viewAllHref?: string }) {
  if (isLoading) {
    return (
      <section className="mb-14">
        <div className="h-7 w-48 bg-[#222] rounded mb-6 animate-pulse" />
        <div className="flex gap-5 overflow-hidden">
          {[1,2,3,4,5].map(i => <div key={i} className="min-w-[160px] h-[220px] bg-[#111] rounded-sm animate-pulse" />)}
        </div>
      </section>
    );
  }

  if (hideIfEmpty && !children) return null;

  return (
    <section className="mb-14">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[24px] font-bold text-white tracking-tight">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-[12px] text-[#999] hover:text-[#ccc] transition-colors">
            View all
          </Link>
        )}
      </div>
      {children}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function MixCard({ index, mix, href, onPlay }: { index: number, mix: any, href: string, onPlay: () => void }) {
  const colors = ['#5e42a6', '#4a90e2', '#7ed321', '#f5a623', '#d0021b'];
  const color = colors[(index - 1) % colors.length];

  return (
    <Link href={href} className="min-w-[160px] group block">
      <div className="w-[160px] h-[160px] rounded-sm overflow-hidden bg-[#222] mb-2 relative">
        <img 
          src={mix.artworkUrl || 'https://images.unsplash.com/photo-1514525253344-f24672a06c20?w=200&h=200&fit=crop'} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
        <button
          type="button"
          aria-label={`Play ${mix.title || `Personal Mix ${index}`}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onPlay();
          }}
          className="absolute left-2 top-2 w-9 h-9 rounded-full bg-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" className="ml-0.5"><polygon points="6,4 20,12 6,20" /></svg>
        </button>
        <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: `linear-gradient(transparent, ${color})` }}>
           <div className="bg-black/80 px-2 py-0.5 rounded-sm inline-block text-[10px] font-black italic tracking-tighter text-white">
             MIX {index}
           </div>
        </div>
      </div>
      <p className="text-[13px] font-medium text-white truncate">{mix.title || `Personal Mix ${index}`}</p>
      <p className="text-[12px] text-[#999] truncate">{mix.description || 'Based on your listening'}</p>
    </Link>
  );
}

function StationCard({ station, href, onPlay }: { station: any, href: string, onPlay: () => void }) {
  const cover =
    station.artworkUrl ||
    station.coverUrl ||
    station.tracks?.[0]?.artworkUrl ||
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=240&h=240&fit=crop';
  const trackCount = station.tracks?.length ?? 0;

  return (
    <Link href={href} className="min-w-[180px] max-w-[180px] group block">
      <div className="w-[180px] h-[180px] rounded-sm overflow-hidden bg-[#222] mb-2 relative">
        <img
          src={cover}
          alt={station.title || 'Station artwork'}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=240&h=240&fit=crop'; }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-colors" />
        <button
          type="button"
          aria-label={`Play ${station.title || 'station'}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onPlay();
          }}
          className="absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" className="ml-0.5"><polygon points="6,4 20,12 6,20" /></svg>
        </button>
      </div>
      <p className="text-[14px] font-bold text-white truncate">{station.title || 'Station'}</p>
      <p className="text-[12px] text-[#999] truncate">
        {station.description || `${trackCount} tracks`}
      </p>
    </Link>
  );
}

function EditorialCard({ type, title, href, onPlay }: { type: 'DAILY' | 'WEEKLY', title: string, href: string, onPlay: () => void }) {
  const gradient = type === 'DAILY' 
    ? 'from-[#1e3c72] to-[#2a5298]' 
    : 'from-[#ff512f] to-[#dd2476]';
  const label = type === 'DAILY' ? 'DAILY DROPS' : 'WEEKLY WAVE';

  return (
    <Link href={href} className="min-w-[160px] group block">
      <div className={`w-[160px] h-[160px] rounded-sm overflow-hidden mb-2 relative bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-black/20">
          <div className="bg-[#ff5500] px-2 py-0.5 rounded-sm inline-block text-[10px] font-bold text-white w-fit mb-1 shadow-lg">
             {label}
          </div>
          <p className="text-white text-[18px] font-black leading-none uppercase">{title}</p>
        </div>
        <div className="absolute top-2 right-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white/20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <button
          type="button"
          aria-label={`Play ${title}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onPlay();
          }}
          className="absolute left-2 top-2 w-9 h-9 rounded-full bg-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" className="ml-0.5"><polygon points="6,4 20,12 6,20" /></svg>
        </button>
      </div>
      <p className="text-[13px] font-medium text-white truncate">{title}</p>
      <p className="text-[12px] text-[#999] truncate">The best of BioBeats, daily</p>
    </Link>
  );
}

function ArtistCard({ artist, isFollowing, onToggle }: { artist: any, isFollowing: boolean, onToggle: () => void }) {
  return (
    <div className="min-w-[140px] flex flex-col items-center group">
      <Link href={ROUTES.PROFILE(artist.permalink || artist._id)} className="relative mb-3">
        <div className="w-[130px] h-[130px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
          <img 
            src={artist.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&h=140&fit=crop'} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&h=140&fit=crop'; }}
          />
        </div>
        {!isFollowing && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
             <div className="w-10 h-10 bg-[#ff5500] rounded-full flex items-center justify-center shadow-xl">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
             </div>
          </div>
        )}
      </Link>
      <Link href={ROUTES.PROFILE(artist.permalink || artist._id)} className="text-[14px] font-bold text-white mb-1 hover:underline truncate w-full text-center px-2">
        {artist.displayName}
      </Link>
      <span className="text-[12px] text-[#999] mb-4 flex items-center gap-1">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        {fmt(artist.followerCount || 0)} followers
      </span>
      <button 
        onClick={onToggle}
        className={`px-6 py-1.5 rounded-sm text-[13px] font-bold transition-all ${
          isFollowing 
            ? 'border border-[#444] text-[#ccc] hover:border-[#666]' 
            : 'bg-white text-black hover:bg-gray-200'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

function SidebarTrackRow({ track, onPlay }: { track: any, onPlay: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="flex items-center gap-3 py-2 relative group" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div 
        className="w-[45px] h-[45px] bg-[#333] rounded-sm overflow-hidden shrink-0 relative cursor-pointer"
        onClick={onPlay}
      >
        <img 
          src={track.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'} 
          alt={track.title} 
          className="w-full h-full object-cover" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {hovered && (
          <div className="absolute inset-0 bg-black/40 flex justify-center items-center">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center pl-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="black"><polygon points="6,4 20,12 6,20"/></svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 pr-16 box-border">
        <Link href={ROUTES.PROFILE(track.artist?.permalink || track.artist)} className="text-[12px] text-[#999] truncate leading-tight hover:underline">{track.artist?.displayName || track.artist}</Link>
        <Link href={ROUTES.TRACK(track.permalink || track.id || track._id)} className="text-[13px] text-white font-medium truncate group-hover:text-[#ccc] leading-tight hover:underline">{track.title}</Link>
        <div className="flex gap-2 text-[11px] text-[#777] mt-1 items-center font-medium">
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {fmt(track.playCount || 0)}
          </span>
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            {fmt(track.likeCount || 0)}
          </span>
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            {fmt(track.repostCount || 0)}
          </span>
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            {fmt(track.commentCount || 0)}
          </span>
        </div>
      </div>

      {hovered && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button className="w-8 h-8 rounded border border-[#444] bg-[#222] hover:border-[#666] flex items-center justify-center transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff5500" stroke="#ff5500" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button className="w-8 h-8 rounded border border-[#444] bg-[#222] hover:border-[#666] flex items-center justify-center transition-colors">
            <svg width="16" height="4" viewBox="0 0 16 4" fill="#ccc"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="14" cy="2" r="1.5"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

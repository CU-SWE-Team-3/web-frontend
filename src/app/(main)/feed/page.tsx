'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/shared/api/client';
import { NavBar } from '../../../shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { FeedTrackCard } from '@/shared/ui/FeedTrackCard/FeedTrackCard';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

// Temporary MockWaveform until actual waveform data is parsed
const MockWaveform = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 48, width: '100%' }}>
    {Array.from({ length: 80 }, (_, i) => {
      const h = 8 + Math.abs(Math.sin(i * 0.4) * 35) + Math.random() * 10;
      return (
        <div key={i} style={{
          flex: 1, height: h, borderRadius: 1,
          background: i < 30 ? '#ff5500' : 'rgba(255,255,255,0.15)',
          transition: 'background 200ms',
        }} />
      );
    })}
  </div>
);

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [feedTracks, setFeedTracks] = useState<any[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Local liked tracks state (since API is missing)
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  // Local follow state array
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // 1. Fetch Feed
        try {
          const feedRes = await apiClient.get(`/network/feed`, { withCredentials: true });
          if (feedRes.data.success) {
            setFeedTracks(feedRes.data.data || []);
          }
        } catch (err) {
          console.warn('Failed to fetch feed:', err);
        }

        // 2. Fetch Suggested Artists
        try {
          const suggestRes = await apiClient.get(`/network/suggested`, { withCredentials: true });
          if (suggestRes.data.success) {
            const arr = suggestRes.data.data || [];
            setSuggestedArtists(arr);
            const folMap: Record<string, boolean> = {};
            arr.forEach((a: any) => folMap[a._id] = false); // Start all as false for mock
            setFollowingMap(folMap);
          }
        } catch (err) {
          console.warn('Failed to fetch suggested artists:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleFollowToggle = async (artistId: string) => {
    if (!isAuthenticated) return;
    const currentlyFollowing = followingMap[artistId];
    
    // Optimistic UI update
    setFollowingMap(prev => ({ ...prev, [artistId]: !currentlyFollowing }));

    try {
      if (currentlyFollowing) {
        await apiClient.delete(`/network/${artistId}/follow`, { withCredentials: true });
      } else {
        await apiClient.post(`/network/${artistId}/follow`, {}, { withCredentials: true });
        
        // Optimistic injection into my following list
        const authState = useAuthStore.getState();
        const myId = (authState.user as any)?._id || authState.user?.id;
        if (myId) {
          const targetArtist = suggestedArtists.find(a => a._id === artistId);
          if (targetArtist) {
            const key = ["network", "following", myId];
            const prev = queryClient.getQueryData<any[]>(key);
            const newEntry = {
              id: artistId,
              username: targetArtist.permalink || targetArtist._id,
              displayName: targetArtist.displayName || 'Newly Followed User',
              avatarUrl: targetArtist.avatarUrl || null,
              followerCount: (targetArtist.followerCount || 0) + 1,
              isFollowing: true
            };
            if (prev) {
              if (!prev.some(u => u.id === artistId)) {
                queryClient.setQueryData(key, [...prev, newEntry]);
              }
            } else {
              queryClient.setQueryData(key, [newEntry]);
            }
          }
        }
      }
      // Invalidate caches in background
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      console.warn('Follow action failed:', err);
      // Revert if failed
      setFollowingMap(prev => ({ ...prev, [artistId]: currentlyFollowing }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'var(--sc-font-family)' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main data-testid="feed-page" style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32 }}>
        {/* ─── Main Feed ─── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
            Hear the latest posts from the people you&apos;re following:
          </h1>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading feed...</div>
          ) : feedTracks.length === 0 ? (
            <div style={{
              background: '#1a1a1a', padding: 40, borderRadius: 12, textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <p style={{ color: '#aaa', fontSize: 16 }}>Your feed is empty.</p>
              <p style={{ color: '#777', fontSize: 13, marginTop: 8 }}>Follow artists or upload tracks to populate your feed.</p>
            </div>
          ) : (
            <div data-testid="feed-track-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {feedTracks.map((item: any) => {
                const track = item.track;
                if (!track) return null;
                const liked = likedTracks.has(track._id);
                return (
                  <div key={track._id} data-testid="feed-track-item">
                    <FeedTrackCard
                      title={track.title}
                    artist={track.artist?.displayName || 'Unknown Artist'}
                    coverUrl={track.artworkUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop'}
                    timeAgo={new Date(item.createdAt).toLocaleDateString()}
                    plays={track.playCount || 0}
                    likes={liked ? (track.likeCount || 0) + 1 : (track.likeCount || 0)}
                    reposts={track.repostCount || 0}
                    comments={track.commentCount || 0}
                    liked={liked}
                    waveformSlot={<MockWaveform />}
                    onPlay={() => {}}
                    actionsSlot={
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          data-testid="track-card-like-button"
                          onClick={() => {
                            setLikedTracks(prev => {
                              const next = new Set(prev);
                              if (next.has(track._id)) next.delete(track._id);
                              else next.add(track._id);
                              return next;
                            });
                          }}
                          style={{
                            background: liked ? 'var(--sc-primary, #ff5500)' : 'transparent',
                            border: liked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                            color: liked ? '#fff' : '#999',
                            borderRadius: 4, padding: '4px 10px',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          {liked ? '♥ Liked' : '♡ Like'}
                        </button>
                      </div>
                    }
                  />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <aside style={{ width: 300, flexShrink: 0 }}>
          {/* Artists You Should Follow */}
          <div data-testid="feed-artist-suggestions" style={{
            background: '#1a1a1a',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: 20,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ccc', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Artists you should follow
            </h3>

            {loading ? (
              <div style={{ color: '#666', fontSize: 13 }}>Loading suggestions...</div>
            ) : suggestedArtists.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>No suggestions right now.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {suggestedArtists.slice(0, 3).map((artist: any) => {
                  const isFol = followingMap[artist._id];
                  return (
                    <div key={artist._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Link href={ROUTES.PROFILE(artist.permalink || artist._id)}>
                        <img
                          src={artist.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
                          alt={artist.displayName}
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', background: '#333' }}
                        />
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={ROUTES.PROFILE(artist.permalink || artist._id)} style={{ color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'block' }}>
                          {artist.displayName}
                        </Link>
                        <div style={{ fontSize: 11, color: '#777' }}>
                          {fmt(artist.followerCount || 0)} followers
                        </div>
                      </div>
                      <button 
                        data-testid="feed-artist-follow-button"
                        onClick={() => handleFollowToggle(artist._id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 4,
                          border: isFol ? 'none' : '1px solid rgba(255,255,255,0.15)',
                          background: isFol ? 'var(--sc-primary, #ff5500)' : 'transparent',
                          color: isFol ? '#fff' : '#ff5500',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}>
                        {isFol ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

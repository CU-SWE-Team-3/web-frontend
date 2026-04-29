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
import { RecentlyPlayed } from '@/features/player/ui/history/RecentlyPlayed';
import { useHistoryStore } from '@/features/player/model/historyStore';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';



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

  // History & Player for Recently Played
  const recentlyPlayed = useHistoryStore((st) => st.recentlyPlayed);
  const listeningHistory = useHistoryStore((st) => st.listeningHistory);
  const clearRecent = useHistoryStore((st) => st.clearRecent);
  const play = usePlayerStore((st) => st.play);

  // Liked tracks for sidebar
  const { data: likedTracksList } = useLikedTracks();

  // Local liked tracks state for feed track cards
  const [feedLikedSet, setFeedLikedSet] = useState<Set<string>>(new Set());

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

  const handlePlayTrack = (trackNode: any) => {
    const track = {
      id: trackNode.id || trackNode._id,
      title: trackNode.title,
      artist: trackNode.artist?.displayName || trackNode.artist || 'Unknown',
      artworkUrl: trackNode.artworkUrl || null,
      hlsUrl: trackNode.hlsUrl || trackNode.streamUrl || '',
      duration: trackNode.duration || 0,
    };
    play(track);
  };

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
          {/* Recently Played Section */}
          {recentlyPlayed.length > 0 && (
            <div style={{ marginBottom: 32 }} data-testid="feed-recently-played">
              <RecentlyPlayed
                tracks={recentlyPlayed}
                onPlay={(track) => play(track)}
                onClear={clearRecent}
              />
            </div>
          )}

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
                const liked = feedLikedSet.has(track._id);
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
                      audioUrl={track.hlsUrl || track.streamUrl}
                      onPlay={() => handlePlayTrack(track)}
                      actionsSlot={
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            data-testid="track-card-like-button"
                            onClick={() => {
                              setFeedLikedSet((prev: Set<string>) => {
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

          {/* ─── Sidebar Likes Section ─── */}
          <div data-testid="feed-sidebar-likes" style={{
            marginTop: 32,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>
                {likedTracksList?.length ? `${likedTracksList.length} ` : ''}LIKES
              </h3>
              {likedTracksList && likedTracksList.length > 0 && (
                <Link href={ROUTES.LIBRARY_LIKES} style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>
                  View all
                </Link>
              )}
            </div>

            {likedTracksList && likedTracksList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {likedTracksList.slice(0, 3).map((track: any) => (
                  <SidebarTrackRow
                    key={track.id}
                    artwork={track.artworkUrl}
                    title={track.title}
                    artist={track.artist}
                    plays={track.playCount}
                    likes={track.likeCount}
                    reposts={track.repostCount}
                    comments={track.commentCount}
                    isLiked={track.isLiked ?? true}
                    onPlay={() => { }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#666' }}>No liked tracks yet.</div>
            )}
          </div>

          {/* ─── Sidebar History Section ─── */}
          <div data-testid="feed-sidebar-history" style={{
            marginTop: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>
                LISTENING HISTORY
              </h3>
              {listeningHistory && listeningHistory.length > 0 && (
                <Link href={ROUTES.HISTORY} style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>
                  View all
                </Link>
              )}
            </div>

            {listeningHistory && listeningHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {listeningHistory.slice(0, 3).map((entry: any) => {
                  const track = entry.track;
                  return (
                    <SidebarTrackRow
                      key={entry.id}
                      artwork={track.artworkUrl}
                      title={track.title}
                      artist={track.artist}
                      plays={track.playCount}
                      likes={track.likeCount}
                      reposts={track.repostCount}
                      comments={track.commentCount}
                      isLiked={feedLikedSet.has(track.id)}
                      onPlay={() => play(track)}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#666' }}>No recently played tracks.</div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sidebar track row — used by both Likes & History
   ───────────────────────────────────────────── */
function SidebarTrackRow({
  artwork, title, artist, plays, likes, reposts, comments, isLiked: initLiked, onPlay
}: {
  artwork?: string | null;
  title: string;
  artist: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  isLiked?: boolean;
  onPlay?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(initLiked ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function fmt(n?: number) {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  }

  const showActions = hovered || menuOpen;

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Artwork */}
      <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: '#333' }}>
        {artwork && <img src={artwork} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        {hovered && (
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
            onClick={onPlay}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="6,4 20,12 6,20" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* Title + artist + meta */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: showActions ? 80 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 11, color: '#666', alignItems: 'center' }}>
          {plays !== undefined && <span>▶ {fmt(plays)}</span>}
          {likes !== undefined && <span>♥ {fmt(likes)}</span>}
          {reposts !== undefined && <span>↺ {fmt(reposts)}</span>}
          {comments !== undefined && <span>💬 {fmt(comments)}</span>}
        </div>
      </div>

      {/* Hover action buttons */}
      {showActions && (
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            style={{ background: liked ? '#ff5500' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'white' : 'none'} stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="14" height="4" viewBox="0 0 16 4" fill="white">
                <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="14" cy="2" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '4px 0', zIndex: 100, minWidth: 160, boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column'
              }}>
                <DropdownItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" /></svg>} label="Repost" />
                <DropdownItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>} label="Share" />
                <DropdownItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>} label="Copy Link" />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                <DropdownItem
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l4 4-4 4M19 14H5M5 6h14" /></svg>}
                  label="Add to Next up"
                  onClick={() => {
                    addToQueue({
                      id: title + artist, // Fallback if no id, though title+artist is better than nothing
                      title,
                      artist,
                      artworkUrl: artwork || '',
                    });
                    setMenuOpen(false);
                  }}
                />
                <DropdownItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>} label="Add to Playlist" />
                <DropdownItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} label="Station" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  const [bg, setBg] = useState('transparent');
  return (
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: bg, border: 'none',
        color: '#eee', padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.2s'
      }}
      onMouseEnter={() => setBg('rgba(255,255,255,0.06)')}
      onMouseLeave={() => setBg('transparent')}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span style={{ color: '#aaa', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
}

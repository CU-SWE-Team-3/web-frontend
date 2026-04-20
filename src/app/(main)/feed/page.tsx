'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Feature Hooks ────────────────────────────────────────────────────────────
import { useFeed, useSuggestedArtists } from '@/features/feed';
import { useFollowUser } from '@/features/social-graph/model/useFollowUser';
import { useUnfollowUser } from '@/features/social-graph/model/useUnfollowUser';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useHistoryStore } from '@/features/player/model/historyStore';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { FeedTrackCard } from '@/shared/ui/FeedTrackCard/FeedTrackCard';
import { RecentlyPlayed } from '@/features/player/ui/history/RecentlyPlayed';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { SuggestedArtist, FeedTrack } from '@/features/feed';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function FeedTrackSkeleton() {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '16px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ width: 120, height: 120, borderRadius: 6, background: '#252525', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '40%', height: 12, borderRadius: 4, background: '#252525', marginBottom: 10 }} />
        <div style={{ width: '60%', height: 16, borderRadius: 4, background: '#2a2a2a', marginBottom: 16 }} />
        <div style={{ width: '100%', height: 40, borderRadius: 4, background: '#222' }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

function SuggestedArtistSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#252525', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '60%', height: 12, borderRadius: 4, background: '#252525', marginBottom: 6 }} />
        <div style={{ width: '40%', height: 10, borderRadius: 4, background: '#222' }} />
      </div>
      <div style={{ width: 64, height: 28, borderRadius: 4, background: '#252525' }} />
    </div>
  );
}

// ─── Waveform Display ─────────────────────────────────────────────────────────
function FeedWaveform({ data }: { data?: number[] }) {
  const bars = data && data.length > 0 ? data : Array.from({ length: 80 }, (_, i) => {
    return 8 + Math.abs(Math.sin(i * 0.4) * 35);
  });
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 48, width: '100%' }}>
      {bars.slice(0, 80).map((h, i) => (
        <div key={i} style={{
          flex: 1,
          height: Math.max(3, (h / 100) * 48),
          borderRadius: 1,
          background: i < 25 ? 'var(--sc-primary, #ff5500)' : 'rgba(255,255,255,0.15)',
          transition: 'background 200ms',
        }} />
      ))}
    </div>
  );
}

// ─── Empty Feed State ─────────────────────────────────────────────────────────
function EmptyFeed() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #131313 100%)',
      padding: '48px 32px',
      borderRadius: 16,
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Your feed is empty
      </h2>
      <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
        Follow artists to hear what they&apos;re uploading. Check out who&apos;s trending right now.
      </p>
      <Link href={ROUTES.TRENDING ?? '/trending'}
        style={{
          display: 'inline-block',
          background: 'var(--sc-primary, #ff5500)',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 24,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Discover Trending Tracks →
      </Link>
    </div>
  );
}

// ─── Sidebar Suggested Artist Card ───────────────────────────────────────────
function SuggestedArtistCard({
  artist,
  isFollowing,
  onToggle,
  disabled,
}: {
  artist: SuggestedArtist;
  isFollowing: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      data-testid="feed-suggested-artist-card"
      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <Link href={ROUTES.PROFILE(artist.permalink || artist._id)} style={{ flexShrink: 0 }}>
        <img
          src={
            artist.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'
          }
          alt={artist.displayName}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            objectFit: 'cover', background: '#333', cursor: 'pointer',
          }}
        />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={ROUTES.PROFILE(artist.permalink || artist._id)}
          style={{
            color: '#fff', textDecoration: 'none', fontSize: 14,
            fontWeight: 600, display: 'block',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {artist.displayName}
        </Link>
        <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>
          {fmt(artist.followerCount)} followers
        </div>
      </div>
      <button
        data-testid="feed-artist-follow-button"
        onClick={onToggle}
        disabled={disabled}
        style={{
          padding: '6px 14px',
          borderRadius: 4,
          border: isFollowing ? 'none' : '1px solid rgba(255,255,255,0.15)',
          background: isFollowing ? 'var(--sc-primary, #ff5500)' : 'transparent',
          color: isFollowing ? '#fff' : '#ff5500',
          fontSize: 12,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

// ─── Sidebar Track Row ────────────────────────────────────────────────────────
function SidebarTrackRow({
  artwork, title, artist, plays, likes, reposts, comments, isLiked: initLiked, onPlay,
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

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: '#333' }}>
        {artwork && <img src={artwork} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        {hovered && (
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onPlay}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="6,4 20,12 6,20" /></svg>
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: hovered ? 40 : 0 }}>
        <div style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 11, color: '#666' }}>
          {plays !== undefined && <span>▶ {fmt(plays)}</span>}
          {likes !== undefined && <span>♥ {fmt(likes)}</span>}
        </div>
      </div>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
          style={{ position: 'absolute', right: 0, background: liked ? '#ff5500' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'white' : 'none'} stroke="white" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // ── Data Hooks ───────────────────────────────────────────────────────────────
  const { data: feedTracks = [], isLoading: feedLoading } = useFeed();
  const { data: suggestedArtists = [], isLoading: suggestLoading } = useSuggestedArtists(5);
  const { data: likedTracksList } = useLikedTracks();

  // ── Player / History ─────────────────────────────────────────────────────────
  const recentlyPlayed = useHistoryStore((st) => st.recentlyPlayed);
  const listeningHistory = useHistoryStore((st) => st.listeningHistory);
  const clearRecent = useHistoryStore((st) => st.clearRecent);
  const play = usePlayerStore((st) => st.play);

  // ── Like / Unlike Mutations ──────────────────────────────────────────────────
  const { mutate: likeTrack } = useLikeTrack();
  const { mutate: unlikeTrack } = useUnlikeTrack();

  // ── Follow / Unfollow ────────────────────────────────────────────────────────
  const { mutate: followUser, isPending: followPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: unfollowPending } = useUnfollowUser();

  // ── Local optimistic follow state ────────────────────────────────────────────
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});

  const isFollowing = useCallback(
    (id: string) => followMap[id] ?? false,
    [followMap],
  );

  const handleFollowToggle = useCallback(
    (artist: SuggestedArtist) => {
      if (!isAuthenticated) return;
      const currentlyFollowing = isFollowing(artist._id);

      // Optimistic update
      setFollowMap((prev) => ({ ...prev, [artist._id]: !currentlyFollowing }));

      if (currentlyFollowing) {
        unfollowUser(artist._id, {
          onError: () => setFollowMap((prev) => ({ ...prev, [artist._id]: true })),
        });
      } else {
        followUser(
          { targetId: artist._id, targetUser: { displayName: artist.displayName, avatarUrl: artist.avatarUrl, followerCount: artist.followerCount } },
          { onError: () => setFollowMap((prev) => ({ ...prev, [artist._id]: false })) },
        );
      }
    },
    [isAuthenticated, isFollowing, followUser, unfollowUser],
  );

  // ── Like toggle (per-track) ──────────────────────────────────────────────────
  const likedSet = new Set((likedTracksList ?? []).map((t) => t.id));
  const [localLikedMap, setLocalLikedMap] = useState<Record<string, boolean>>({});

  const isLiked = (trackId: string) => localLikedMap[trackId] ?? likedSet.has(trackId);

  const handleLikeToggle = useCallback(
    (track: FeedTrack) => {
      if (!isAuthenticated) return;
      const currently = isLiked(track._id);
      setLocalLikedMap((prev) => ({ ...prev, [track._id]: !currently }));
      if (currently) {
        unlikeTrack(track._id, {
          onError: () => setLocalLikedMap((prev) => ({ ...prev, [track._id]: true })),
        });
      } else {
        likeTrack(track._id, {
          onError: () => setLocalLikedMap((prev) => ({ ...prev, [track._id]: false })),
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, likedSet, likeTrack, unlikeTrack],
  );

  const isActionPending = followPending || unfollowPending;

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'var(--sc-font-family)' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main
        data-testid="feed-page"
        style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32 }}
      >
        {/* ─── Main Feed Column ─── */}
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

          {feedLoading ? (
            <div data-testid="feed-skeleton">
              {[1, 2, 3].map((i) => <FeedTrackSkeleton key={i} />)}
            </div>
          ) : feedTracks.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div data-testid="feed-track-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {feedTracks.map((track) => {
                const liked = isLiked(track._id);
                return (
                  <div key={track._id} data-testid="feed-track-item">
                    <FeedTrackCard
                      title={track.title}
                      artist={track.artist?.displayName ?? 'Unknown Artist'}
                      coverUrl={
                        track.artworkUrl ||
                        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop'
                      }
                      timeAgo={timeAgo(track.createdAt)}
                      genre={track.genre}
                      plays={track.playCount}
                      likes={liked ? (track.likeCount + 1) : track.likeCount}
                      reposts={track.repostCount}
                      comments={track.commentCount}
                      liked={liked}
                      waveformSlot={<FeedWaveform data={track.waveform} />}
                      onPlay={() => {
                        play({
                          id: track._id,
                          title: track.title,
                          artist: track.artist?.displayName ?? 'Unknown Artist',
                          artworkUrl: track.artworkUrl ?? '',
                          streamUrl: track.hlsUrl ?? '',
                          hlsUrl: track.hlsUrl ?? '',
                          duration: track.duration
                            ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
                            : '0:00',
                          waveform: track.waveform ?? [],
                        } as any);
                      }}
                      actionsSlot={
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          {/* Like Button */}
                          <button
                            data-testid="track-card-like-button"
                            onClick={() => handleLikeToggle(track)}
                            style={{
                              background: liked ? 'var(--sc-primary, #ff5500)' : 'transparent',
                              border: liked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                              color: liked ? '#fff' : '#999',
                              borderRadius: 4,
                              padding: '4px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {liked ? '♥ Liked' : '♡ Like'}
                          </button>

                          {/* Artist Profile Link */}
                          <Link
                            href={ROUTES.PROFILE(track.artist?.permalink || track.artist?._id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#aaa',
                              borderRadius: 4,
                              padding: '4px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                            }}
                          >
                            View Profile
                          </Link>
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

          {/* ── Suggested Artists ── */}
          <div
            data-testid="feed-artist-suggestions"
            style={{
              background: '#1a1a1a',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: 20,
              marginBottom: 32,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ccc', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>
              Artists you should follow
            </h3>

            {suggestLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map((i) => <SuggestedArtistSkeleton key={i} />)}
              </div>
            ) : suggestedArtists.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>No suggestions right now.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {suggestedArtists.slice(0, 5).map((artist) => (
                  <SuggestedArtistCard
                    key={artist._id}
                    artist={artist}
                    isFollowing={isFollowing(artist._id)}
                    onToggle={() => handleFollowToggle(artist)}
                    disabled={isActionPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar Likes Section ── */}
          <div
            data-testid="feed-sidebar-likes"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              paddingBottom: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
                {likedTracksList.slice(0, 3).map((track) => (
                  <SidebarTrackRow
                    key={track.id}
                    artwork={track.artworkUrl}
                    title={track.title}
                    artist={track.artist}
                    plays={track.playCount}
                    likes={track.likeCount}
                    isLiked={true}
                    onPlay={() => play(track as any)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#666' }}>No liked tracks yet.</div>
            )}
          </div>

          {/* ── Sidebar Listening History ── */}
          <div data-testid="feed-sidebar-history">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>
                Listening History
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
                      artwork={track?.artworkUrl}
                      title={track?.title ?? 'Unknown'}
                      artist={track?.artist ?? 'Unknown'}
                      plays={track?.playCount}
                      likes={track?.likeCount}
                      isLiked={false}
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

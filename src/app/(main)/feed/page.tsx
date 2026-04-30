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
import { useRepostTrack } from '@/features/track-engagement/model/useRepostTrack';
import { useUnrepostTrack } from '@/features/track-engagement/model/useUnrepostTrack';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useHistoryStore } from '@/features/player/model/historyStore';
import { WaveformPlayer } from '@/features/tracks/ui/WaveformPlayer';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { FeedTrackCard } from '@/shared/ui/FeedTrackCard/FeedTrackCard';
import { RecentlyPlayed } from '@/features/player/ui/history/RecentlyPlayed';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import apiClient from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { SuggestedArtist, FeedActivity, FeedTrack } from '@/features/feed';
import { useUserReposts } from '@/features/track-engagement/model/useUserReposts';

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

// ─── Waveform is now handled by the real WaveformPlayer component ────────────

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
      className="flex items-center gap-3 py-2 relative group cursor-pointer" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
    >
      <div className="w-[45px] h-[45px] bg-[#333] rounded-sm overflow-hidden shrink-0 relative">
        <img 
          src={artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'} 
          alt={title} 
          className="w-full h-full object-cover" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {hovered && (
          <div className="absolute inset-0 bg-black/40 flex justify-center items-center">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center pl-0.5 shadow-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="black"><polygon points="6,4 20,12 6,20"/></svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 pr-12 box-border">
        <span className="text-[12px] text-[#999] truncate leading-tight">{artist}</span>
        <span className="text-[13px] text-white font-medium truncate group-hover:text-[#ccc] leading-tight">{title}</span>
        <div className="flex gap-2 text-[11px] text-[#777] mt-1 items-center font-medium">
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {fmt(plays || 0)}
          </span>
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            {fmt(likes || 0)}
          </span>
          {(reposts !== undefined) && (
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
              {fmt(reposts)}
            </span>
          )}
        </div>
      </div>

      {hovered && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="w-7 h-7 rounded border border-[#444] bg-[#222] hover:border-[#666] flex items-center justify-center transition-colors shadow-lg"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "#ff5500" : "none"} stroke={liked ? "#ff5500" : "#ccc"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // ── Data Hooks ───────────────────────────────────────────────────────────────
  const { data: feedActivities = [], isLoading: feedLoading } = useFeed();
  const { data: suggestedArtists = [], isLoading: suggestLoading, refetch: refetchSuggestions } = useSuggestedArtists(5);
  const { data: likedTracksList } = useLikedTracks();
  const likedTrackIds = (likedTracksList ?? []).map(t => t.id);

  // ── Auth user + own reposts ──────────────────────────────────────────────────
  const currentUser = useAuthStore((s) => s.user);
  const userId = (currentUser as any)?._id || currentUser?.id || '';
  const { data: userRepostsData = [] } = useUserReposts(userId);

  const repostedByMeIds = new Set(
    (userRepostsData ?? []).map((r: any) =>
      r.target?._id || r.target?.id || r.track?._id || r.track?.id || ''
    ).filter(Boolean)
  );
  const [localRepostMap, setLocalRepostMap] = useState<Record<string, boolean>>({});
  const isReposted = (id: string) => localRepostMap[id] ?? repostedByMeIds.has(id);

  // ── Repost filter toggle ──────────────────────────────────────────────────────
  const [showReposts, setShowReposts] = useState(true);

  // Merge user's own reposts into feed, filtered by toggle
  const mergedFeed: FeedActivity[] = React.useMemo(() => {
    if (!showReposts) return feedActivities.filter(a => a.activityType === 'TRACK_UPLOAD');
    const feedTrackIds = new Set(feedActivities.map(a => a.target?._id));
    const myRepostActivities: FeedActivity[] = (userRepostsData ?? []).flatMap((r: any) => {
      const t = r.target || r.track;
      if (!t || feedTrackIds.has(t._id || t.id)) return [];
      return [{
        activityType: 'REPOST' as const,
        activityDate: r.repostDate || r.createdAt || new Date().toISOString(),
        actors: [{ _id: userId, displayName: currentUser?.displayName || currentUser?.username || 'You', permalink: (currentUser as any)?.permalink || userId, avatarUrl: (currentUser as any)?.avatarUrl }],
        target: {
          _id: t._id || t.id || '', title: t.title || 'Untitled', permalink: t.permalink || t._id || '',
          artworkUrl: t.artworkUrl, hlsUrl: t.hlsUrl || t.streamUrl, waveform: Array.isArray(t.waveform) ? t.waveform : undefined,
          duration: t.duration, genre: t.genre || '', playCount: t.playCount ?? 0, likeCount: t.likeCount ?? 0,
          repostCount: t.repostCount ?? 0, commentCount: t.commentCount ?? 0, createdAt: t.createdAt || '',
          artist: { _id: t.artist?._id || '', displayName: t.artist?.displayName || 'Unknown Artist', permalink: t.artist?.permalink || '', avatarUrl: t.artist?.avatarUrl },
        },
        targetModel: 'Track',
      }];
    });
    return [...feedActivities, ...myRepostActivities].sort(
      (a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
    );
  }, [feedActivities, userRepostsData, showReposts, userId, currentUser]);

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

  // ── Repost / Share / Copy Link ────────────────────────────────────────────────
  const repostTrackMut = useRepostTrack();
  const unrepostTrackMut = useUnrepostTrack();

  const handleRepost = (track: FeedTrack) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const currently = isReposted(track._id);
    setLocalRepostMap(prev => ({ ...prev, [track._id]: !currently }));
    if (currently) {
      unrepostTrackMut.mutate(track._id, {
        onError: () => setLocalRepostMap(prev => ({ ...prev, [track._id]: true })),
      });
    } else {
      repostTrackMut.mutate({ trackId: track._id, track }, {
        onError: () => setLocalRepostMap(prev => ({ ...prev, [track._id]: false })),
      });
    }
  };

  const handleCopyLink = (track: FeedTrack) => {
    const url = `${window.location.origin}/tracks/${track.permalink || track._id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleShare = (track: FeedTrack) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: track.title,
        text: `Check out ${track.title} by ${track.artist.displayName} on BioBeats`,
        url: `${window.location.origin}/tracks/${track.permalink || track._id}`,
      }).catch(() => {});
    } else {
      handleCopyLink(track);
    }
  };

  // ── Like toggle (per-track) ──────────────────────────────────────────────────
  const [localLikedMap, setLocalLikedMap] = useState<Record<string, boolean>>({});

  const isLiked = (id: string) => localLikedMap[id] ?? likedTrackIds.includes(id);

  const handleLikeToggle = (track: FeedTrack) => {
    if (!isAuthenticated) { router.push('/login'); return; }
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
  };

  const isActionPending = followPending || unfollowPending;

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'var(--sc-font-family)' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main
        data-testid="feed-page"
        style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', display: 'flex', gap: 32, flexWrap: 'wrap' }}
      >
        {/* ─── Main Feed Column ─── */}
        <div style={{ flex: 1, minWidth: 'min(100%, 300px)' }}>

          {/* Recently Played Section Moved to Sidebar */}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>
              Hear the latest posts from the people you&apos;re following:
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#999' }}>Reposts</span>
              <div
                onClick={() => setShowReposts(v => !v)}
                style={{ width: 36, height: 20, background: showReposts ? '#ff5500' : '#444', borderRadius: 10, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: showReposts ? 18 : 2, transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>

          {feedLoading ? (
            <div data-testid="feed-skeleton">
              {[1, 2, 3].map((i) => <FeedTrackSkeleton key={i} />)}
            </div>
          ) : mergedFeed.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div data-testid="feed-track-list" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {mergedFeed.map((activity, idx) => {
                const track = activity.target;
                const actor = activity.actors[0] || track.artist;
                const liked = isLiked(track._id);
                const actionText = activity.activityType === 'TRACK_UPLOAD' ? 'posted a track' : 
                                  activity.activityType === 'REPOST' ? 'reposted a track' : 
                                  activity.activityType === 'LIKE' ? 'liked a track' : 'posted a track';
                return (
                  <div key={`${track._id}-${idx}`} data-testid="feed-track-item">
                    <FeedTrackCard
                      title={track.title}
                      artist={track.artist?.displayName ?? 'Unknown Artist'}
                      artistPermalink={track.artist?.permalink || track.artist?._id}
                      trackPermalink={track.permalink || track._id}
                      coverUrl={
                        track.artworkUrl ||
                        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop'
                      }
                      reposterName={actor.displayName}
                      reposterAvatarUrl={actor.avatarUrl}
                      reposterPermalink={actor.permalink}
                      actionType={actionText as any}
                      repostTime={timeAgo(activity.activityDate || track.createdAt)}
                      plays={track.playCount}
                      likes={liked ? (track.likeCount + 1) : track.likeCount}
                      reposts={track.repostCount}
                      comments={track.commentCount}
                      liked={liked}
                      waveformSlot={
                        <WaveformPlayer 
                          waveform={track.waveform} 
                          audioUrl={track.hlsUrl}
                          durationSeconds={track.duration}
                          hidePlayButton 
                          trackMeta={{
                            id: track._id,
                            title: track.title,
                            artist: track.artist?.displayName || 'Artist',
                            artworkUrl: track.artworkUrl,
                            hlsUrl: track.hlsUrl
                          }}
                        />
                      }
                      onPlay={async () => {
                        // Feed targets are TrackSummary — no hlsUrl in the response.
                        // Must call /player/{id}/stream to get the actual HLS URL.
                        let streamUrl = track.hlsUrl ?? (track as any).streamUrl ?? '';
                        if (!streamUrl) {
                          try {
                            const { data: streamData } = await apiClient.get(`/player/${track._id}/stream`);
                            streamUrl = streamData?.data?.streamUrl ?? streamData?.data?.hlsUrl ?? '';
                          } catch { /* play with empty url, engine will handle gracefully */ }
                        }
                        play({
                          id: track._id,
                          title: track.title,
                          artist: track.artist?.displayName ?? 'Unknown Artist',
                          artworkUrl: track.artworkUrl ?? '',
                          streamUrl,
                          hlsUrl: streamUrl,
                          duration: track.duration,
                          waveform: track.waveform ?? [],
                        } as any);
                      }}
                      actionsSlot={
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            data-testid="track-card-like-button"
                            onClick={() => handleLikeToggle(track)}
                            style={{
                              background: liked ? 'var(--sc-primary, #ff5500)' : 'transparent',
                              border: liked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                              color: liked ? '#fff' : '#ccc',
                              borderRadius: 4,
                              padding: '4px 8px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'white' : 'none'} stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {liked ? 'Liked' : 'Like'}
                          </button>

                          <button 
                            onClick={() => handleRepost(track)}
                            style={{ background: isReposted(track._id) ? 'rgba(255,85,0,0.2)' : 'transparent', border: isReposted(track._id) ? '1px solid #ff5500' : '1px solid rgba(255,255,255,0.15)', color: isReposted(track._id) ? '#ff5500' : '#ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                            {isReposted(track._id) ? 'Reposted' : 'Repost'}
                          </button>

                          <button 
                            onClick={() => handleShare(track)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                            Share
                          </button>

                          <button 
                            onClick={() => handleCopyLink(track)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            Copy Link
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
        <aside style={{ width: 'min(300px, 100%)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* ── Listening History ── */}
          {recentlyPlayed.length > 0 && (
            <div className="mb-8">
              <div className="flex items-end justify-between border-b border-[#333] pb-2 mb-4">
                <h3 className="text-[12px] font-bold text-[#ccc] uppercase tracking-wider">
                  LISTENING HISTORY
                </h3>
                <Link href={ROUTES.HISTORY} className="text-[12px] text-[#999] hover:text-[#ccc]">
                  View all
                </Link>
              </div>
              <div className="flex flex-col">
                {recentlyPlayed.slice(0, 3).map((track: any) => (
                  <SidebarTrackRow 
                    key={`hist-${track.id || track._id}`} 
                    artwork={track.artworkUrl}
                    title={track.title}
                    artist={track.artist}
                    plays={track.playCount}
                    likes={track.likeCount}
                    onPlay={() => play(track)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Artist Tools Card */}
          <div className="bg-[#1a1a1a] rounded-sm mb-8" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="border-b border-[#333] p-4 flex justify-between items-center cursor-pointer hover:bg-[#222]">
              <h3 className="text-[12px] font-bold text-[#ccc] tracking-wider uppercase">Artist Tools</h3>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div className="p-4 bg-[#111]">
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#ff5500] text-[10px]">✦</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Amplify</span>
                </div>
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#a53bba] text-[10px]">✦</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 21l6-6M9 8L3 2M3 21l6-6"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Replace</span>
                </div>
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#a53bba] text-[10px]">✦</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Distribute</span>
                </div>
                <div className="border border-[#333] rounded-sm aspect-square flex flex-col items-center justify-center p-2 hover:border-[#666] cursor-pointer transition-colors group relative">
                  <span className="absolute top-1 right-1 text-[#a53bba] text-[10px]">✦</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-1 group-hover:stroke-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  <span className="text-[10px] text-[#999] group-hover:text-[#ccc]">Master</span>
                </div>
              </div>
              <button className="w-full bg-[#352554] hover:bg-[#432d69] text-[#e5d9f2] text-[13px] font-medium py-2.5 rounded-sm flex items-center justify-center gap-2 transition-colors">
                Unlock Artist tools from EGP 29.99/mo.
              </button>
            </div>
          </div>

          {/* ── Artists you should follow ── */}
          <div data-testid="suggested-artists-section" className="mb-8 border-b border-[#333] pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold text-[#ccc] uppercase tracking-wider">
                Artists you should follow
              </h3>
              <button 
                onClick={() => refetchSuggestions()}
                disabled={suggestLoading}
                className="text-[12px] text-[#999] hover:text-[#ccc]"
              >
                Refresh list
              </button>
            </div>

            {suggestLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map((i) => <SuggestedArtistSkeleton key={i} />)}
              </div>
            ) : suggestedArtists.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>No suggestions right now.</div>
            ) : (
              <div className="flex flex-col gap-5">
                {suggestedArtists.slice(0, 3).map((artist) => {
                  const isFol = isFollowing(artist._id);
                  return (
                    <div key={artist._id} className="flex items-center gap-3">
                      <Link href={ROUTES.PROFILE(artist.permalink || artist._id)}>
                        <div className="w-[50px] h-[50px] rounded-full bg-[#333] overflow-hidden shrink-0 border border-white/5">
                          <img 
                            src={artist.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'} 
                            alt={artist.displayName} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'; }}
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
                        onClick={() => handleFollowToggle(artist)}
                        disabled={isActionPending}
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
            )}
          </div>

          {/* ── Sidebar Likes Section ── */}
          <div data-testid="feed-sidebar-likes">
            <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
              <h3 className="text-[12px] font-bold text-[#ccc] uppercase tracking-wider">
                {likedTracksList?.length ? `${likedTracksList.length} ` : ''}LIKES
              </h3>
              <Link href={ROUTES.LIBRARY_LIKES} className="text-[12px] text-[#999] hover:text-[#ccc]">
                View all
              </Link>
            </div>

            {likedTracksList && likedTracksList.length > 0 ? (
              <div className="flex flex-col">
                {likedTracksList.slice(0, 3).map((track: any) => (
                  <SidebarTrackRow 
                    key={track.id || track._id} 
                    artwork={track.artworkUrl}
                    title={track.title}
                    artist={track.artist?.displayName || track.artist}
                    plays={track.playCount}
                    likes={track.likeCount}
                    reposts={track.repostCount}
                    comments={track.commentCount}
                    isLiked={true}
                    onPlay={() => play({
                      id: track.id || track._id,
                      title: track.title,
                      artist: track.artist?.displayName || track.artist || 'Unknown',
                      artworkUrl: track.artworkUrl,
                      hlsUrl: track.hlsUrl || '',
                      waveform: track.waveform || [],
                      duration: track.duration || 0,
                    } as any)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-[#666]">No liked tracks yet.</div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}


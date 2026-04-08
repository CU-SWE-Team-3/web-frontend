'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { useHistoryStore } from '@/features/player/model/historyStore';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { TrackCard } from '@/features/track-engagement/ui/TrackCard';
import { useFollowing } from '@/features/social-graph/model/useFollowing';
import { useFollowUser } from '@/features/social-graph/model/useFollowUser';
import { useUnfollowUser } from '@/features/social-graph/model/useUnfollowUser';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import { FeedTrackCard } from '@/shared/ui/FeedTrackCard/FeedTrackCard';
import type { FollowNode } from '@/features/social-graph/model/types';
import type { Track } from '@/features/player/model/playerStore';
import s from './Library.module.scss';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'likes', label: 'Likes' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'albums', label: 'Albums' },
  { key: 'stations', label: 'Stations' },
  { key: 'following', label: 'Following' },
  { key: 'history', label: 'History' },
] as const;

type TabKey = (typeof TABS)[number]['key'];
type ViewMode = 'grid' | 'list';

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = TABS.some((t) => t.key === tabParam) ? tabParam! : 'overview';

  // ─── Following state ───
  const user = useAuthStore((s) => s.user);
  const userId = (user as any)?._id || (user as any)?.id || '';
  const { data: followingList, isLoading: followingLoading } = useFollowing(userId);

  // ─── Likes state ───
  const { data: likedTracks, isLoading: likesLoading } = useLikedTracks();
  const [likesView, setLikesView] = useState<ViewMode>('grid');
  const [likesFilter, setLikesFilter] = useState('');

  const filteredLikes = useMemo(() => {
    if (!likedTracks) return [];
    if (!likesFilter.trim()) return likedTracks;
    const q = likesFilter.toLowerCase();
    return likedTracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [likedTracks, likesFilter]);

  // ─── History state ───
  const recentlyPlayed = useHistoryStore((st) => st.recentlyPlayed);
  const listeningHistory = useHistoryStore((st) => st.listeningHistory);
  const clearRecent = useHistoryStore((st) => st.clearRecent);
  const deleteHistoryItem = useHistoryStore((st) => st.deleteHistoryItem);
  const play = usePlayerStore((st) => st.play);
  const [historyFilter, setHistoryFilter] = useState('');

  const filteredHistory = useMemo(() => {
    if (!historyFilter.trim()) return listeningHistory;
    const q = historyFilter.toLowerCase();
    return listeningHistory.filter(
      (e) => e.track.title.toLowerCase().includes(q) || e.track.artist.toLowerCase().includes(q)
    );
  }, [listeningHistory, historyFilter]);

  const handlePlay = (track: Track) => play(track);

  const getWaveformBars = (trackId: string) => {
    let seed = 0;
    for (let i = 0; i < trackId.length; i++) seed += trackId.charCodeAt(i);
    return Array.from({ length: 100 }, (_, i) => {
      const val = Math.abs(Math.sin(seed * 0.1 + i * 0.3) * 80) + 10;
      return Math.floor(val);
    });
  };

  const switchTab = (key: TabKey) => {
    if (key === 'overview') {
      router.push('/library');
    } else {
      router.push(`/library?tab=${key}`);
    }
  };

  return (
    <div className={s.page}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <div className={s.container}>
        {/* ─── Tab Bar ─── */}
        <div className={s.tabBar} data-testid="library-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${s.tab} ${activeTab === tab.key ? s.tabActive : ''}`}
              onClick={() => switchTab(tab.key)}
              data-testid={`library-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'likes' && (
          <LikesTab
            tracks={filteredLikes}
            isLoading={likesLoading}
            filter={likesFilter}
            setFilter={setLikesFilter}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            recentlyPlayed={recentlyPlayed}
            filteredHistory={filteredHistory}
            filter={historyFilter}
            setFilter={setHistoryFilter}
            onPlay={handlePlay}
            onClear={clearRecent}
            onDelete={deleteHistoryItem}
            getWaveformBars={getWaveformBars}
          />
        )}
        {activeTab === 'playlists' && <PlaceholderTab title="Playlists" />}
        {activeTab === 'albums' && <PlaceholderTab title="Albums" />}
        {activeTab === 'stations' && <PlaceholderTab title="Stations" />}
        {activeTab === 'following' && (
          <FollowingTab users={followingList ?? []} isLoading={followingLoading} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════════════════════ */
function OverviewTab() {
  return (
    <div className={s.placeholderTab}>
      <h3>Your Library</h3>
      <p>Browse your likes, playlists, and listening history using the tabs above.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Likes Tab
   ═══════════════════════════════════════════════════════ */
interface LikesTabProps {
  tracks: import('@/features/track-engagement/model/types').TrackNode[];
  isLoading: boolean;
  filter: string;
  setFilter: (v: string) => void;
}

function LikesTab({ tracks, isLoading, filter, setFilter }: LikesTabProps) {
  const unlikeMutation = useUnlikeTrack();
  const play = usePlayerStore((st) => st.play);

  return (
    <div>
      {/* Header */}
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Hear the tracks you&apos;ve liked:</h2>
        <div className={s.headerActions}>
          <input
            type="text"
            placeholder="Filter"
            className={s.filterInput}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            data-testid="likes-filter-input"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-[var(--sc-bg-dark-elevated)] rounded-md animate-pulse" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>♥</div>
          <div className={s.emptyTitle}>No liked tracks yet</div>
          <div className={s.emptyText}>Tracks you like will appear here</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 mt-6 pb-24">
          {tracks.map((track) => (
            <FeedTrackCard
              key={track.id}
              title={track.title}
              artist={track.artist || 'Unknown Artist'}
              coverUrl={track.artworkUrl || undefined}
              plays={(track as any).playCount ?? 0}
              likes={(track as any).likeCount ?? 0}
              reposts={(track as any).repostCount ?? 0}
              comments={(track as any).commentCount ?? 0}
              liked={true}
              audioUrl={(track as any).streamUrl || (track as any).hlsUrl}
              onPlay={() => play({
                id: track.id,
                title: track.title,
                artist: track.artist || 'Unknown Artist',
                artworkUrl: track.artworkUrl || '/placeholder.png',
                hlsUrl: (track as any).streamUrl || (track as any).hlsUrl,
              })}
              actionsSlot={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => unlikeMutation.mutate(track.id)}
                    className="w-8 h-8 rounded border border-[#ff5500] bg-[#ff5500]/10 text-[#ff5500] flex items-center justify-center transition-colors shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                  <button className="w-8 h-8 rounded border border-[#444] bg-[#222] hover:border-[#666] flex items-center justify-center transition-colors text-[#ccc] shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 8v8"/></svg>
                  </button>
                  <button className="w-8 h-8 rounded border border-[#444] bg-[#222] hover:border-[#666] flex items-center justify-center transition-colors text-[#ccc] shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                  </button>
                  <button className="w-8 h-8 rounded border border-[#444] bg-[#222] hover:border-[#666] flex items-center justify-center transition-colors text-[#ccc] shadow-sm">
                    <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="14" cy="2" r="1.5"/></svg>
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   History Tab
   ═══════════════════════════════════════════════════════ */
interface HistoryTabProps {
  recentlyPlayed: Track[];
  filteredHistory: import('@/features/player/model/historyStore').HistoryEntry[];
  filter: string;
  setFilter: (v: string) => void;
  onPlay: (track: Track) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
  getWaveformBars: (trackId: string) => number[];
}

function HistoryTab({
  recentlyPlayed,
  filteredHistory,
  filter,
  setFilter,
  onPlay,
  onClear,
  onDelete,
  getWaveformBars,
}: HistoryTabProps) {
  return (
    <div>
      {/* Recently Played */}
      <section data-testid="history-recently-played">
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Recently played:</h2>
          <div className={s.headerActions}>
            {recentlyPlayed.length > 0 && (
              <button className={s.clearBtn} onClick={onClear} data-testid="clear-all-history-btn">
                Clear all history
              </button>
            )}
            <input
              type="text"
              placeholder="Filter"
              className={s.filterInput}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              data-testid="history-filter-input"
            />
          </div>
        </div>

        {recentlyPlayed.length === 0 ? (
          <div className={s.emptyState} style={{ padding: '40px 20px' }}>
            <div className={s.emptyIcon}>🕐</div>
            <div className={s.emptyTitle}>No recently played tracks</div>
            <div className={s.emptyText}>Tracks you listen to will appear here</div>
          </div>
        ) : (
          <div className={s.grid} style={{ marginBottom: 40 }}>
            {recentlyPlayed.slice(0, 6).map((track, idx) => (
              <button key={track.id} className={s.card} onClick={() => onPlay(track)} data-testid={`recent-card-${idx}`}>
                <div className={s.cardThumb}>
                  {track.artworkUrl ? (
                    <img src={track.artworkUrl} alt={track.title} className={s.cardImg} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--sc-bg-dark-elevated)' }} />
                  )}
                  <div className={s.cardOverlay}>
                    <div className={s.playBtn}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </div>
                <span className={s.cardTitle}>{track.title}</span>
                <span className={s.cardArtist}>{track.artist}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Full Listening History */}
      <section data-testid="history-listening-section">
        <div className={s.sectionHeader} style={{ borderBottom: '1px solid var(--sc-bg-dark-elevated)', paddingBottom: 12 }}>
          <h2 className={s.sectionTitle}>Hear the tracks you&apos;ve played:</h2>
        </div>

        {filteredHistory.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>🎵</div>
            <div className={s.emptyTitle}>No listening history</div>
            <div className={s.emptyText}>Tracks you play will be recorded here</div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-6">
            {filteredHistory.map((entry, idx) => {
              const playedAgo = getTimeAgo(entry.playedAt);
              return (
                <FeedTrackCard
                  key={entry.id}
                  title={entry.track.title}
                  artist={entry.track.artist || 'Unknown Artist'}
                  coverUrl={entry.track.artworkUrl || undefined}
                  timeAgo={playedAgo}
                  plays={(entry.track as any).playCount ?? 0}
                  likes={(entry.track as any).likeCount ?? 0}
                  reposts={(entry.track as any).repostCount ?? 0}
                  comments={(entry.track as any).commentCount ?? 0}
                  liked={false} // Needs global useLikedTracks hook
                  audioUrl={(entry.track as any).streamUrl || (entry.track as any).hlsUrl}
                  onPlay={() => onPlay(entry.track)}
                  actionsSlot={
                    <div className="flex items-center gap-2">
                       <button
                        onClick={() => onDelete(entry.id)}
                        className="ml-auto w-auto px-3 h-8 rounded border border-[#444] bg-transparent hover:border-[#666] flex items-center gap-1 transition-colors text-[#aaa] text-[11px]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-2 14H7L5 6" />
                          <path d="M10 11v6" /><path d="M14 11v6" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Following Tab
   ═══════════════════════════════════════════════════════ */
interface FollowingTabProps {
  users: FollowNode[];
  isLoading: boolean;
}

function FollowingTab({ users, isLoading }: FollowingTabProps) {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [localState, setLocalState] = useState<Record<string, boolean>>({});

  const isFollowing = (user: FollowNode) =>
    localState[user.id] !== undefined ? localState[user.id] : (user.isFollowing ?? true);

  const toggle = (user: FollowNode, e: React.MouseEvent) => {
    e.preventDefault();
    const next = !isFollowing(user);
    setLocalState((prev) => ({ ...prev, [user.id]: next }));
    if (next) {
      followMutation.mutate({ targetId: user.id, targetUser: user });
    } else {
      unfollowMutation.mutate(user.id);
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  if (isLoading) {
    return (
      <div className={s.followingGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={s.followingSkeleton} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={s.emptyState}>
        <div className={s.emptyIcon}>👤</div>
        <div className={s.emptyTitle}>Not following anyone yet</div>
        <div className={s.emptyText}>Artists you follow will appear here</div>
      </div>
    );
  }

  return (
    <div>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>People you follow:</h2>
      </div>
      <div className={s.followingGrid}>
        {users.map((user) => (
          <Link
            key={user.id}
            href={ROUTES.PROFILE(user.username)}
            className={s.followingCard}
            data-testid={`following-card-${user.id}`}
          >
            {/* Avatar */}
            <div className={s.followingAvatar}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} />
              ) : (
                <div className={s.followingAvatarFallback}>
                  {(user.displayName || user.username || '?')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={s.followingInfo}>
              <span className={s.followingName}>{user.displayName || user.username}</span>
              <span className={s.followingMeta}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {formatCount(user.followerCount)} followers
              </span>
            </div>

            {/* Follow/Unfollow Button */}
            <button
              className={`${s.followBtn} ${isFollowing(user) ? s.followBtnActive : ''}`}
              onClick={(e) => toggle(user, e)}
              data-testid={`following-btn-${user.id}`}
            >
              {isFollowing(user) ? 'Following' : 'Follow'}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Placeholder Tab
   ═══════════════════════════════════════════════════════ */
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className={s.placeholderTab}>
      <h3>{title}</h3>
      <p>This section is coming soon.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Helper
   ═══════════════════════════════════════════════════════ */
function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div>Loading library...</div>}>
      <LibraryContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Feature Hooks ────────────────────────────────────────────────────────────
import { useSearch } from '@/features/search';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useFollowUser } from '@/features/social-graph/model/useFollowUser';
import { useUnfollowUser } from '@/features/social-graph/model/useUnfollowUser';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { TrackResult, UserResult, PlaylistResult } from '@/features/search';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDuration(secs?: number): string {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Tab Definition ───────────────────────────────────────────────────────────
type Tab = 'tracks' | 'people' | 'playlists';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tracks', label: 'Tracks' },
  { id: 'people', label: 'People' },
  { id: 'playlists', label: 'Playlists' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ResultSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ width: 56, height: 56, borderRadius: 6, background: '#252525', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '50%', height: 12, borderRadius: 4, background: '#2a2a2a', marginBottom: 8 }} />
        <div style={{ width: '30%', height: 10, borderRadius: 4, background: '#222' }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ─── Track Result Row ─────────────────────────────────────────────────────────
function TrackRow({ track, onPlay }: { track: TrackResult; onPlay: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-testid="search-track-result"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
        borderRadius: 8, background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 150ms', cursor: 'default',
      }}
    >
      {/* Artwork / Play button */}
      <div
        onClick={onPlay}
        style={{ position: 'relative', width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0, cursor: 'pointer' }}
      >
        {track.artworkUrl && (
          <img src={track.artworkUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,85,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="6,4 20,12 6,20" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={ROUTES.TRACK(track.permalink || track._id)}
          style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {track.title}
        </Link>
        <Link
          href={ROUTES.PROFILE(track.artist.permalink || track.artist._id)}
          style={{ fontSize: 12, color: '#888', textDecoration: 'none', marginTop: 2, display: 'block' }}
        >
          {track.artist.displayName}
        </Link>
      </div>

      {/* Genre tag */}
      {track.genre && (
        <span style={{ fontSize: 11, color: '#666', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {track.genre}
        </span>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#666', flexShrink: 0 }}>
        <span>▶ {fmt(track.playCount)}</span>
        <span>♥ {fmt(track.likeCount)}</span>
        {track.duration && <span>{fmtDuration(track.duration)}</span>}
      </div>
    </div>
  );
}

// ─── User Result Row ──────────────────────────────────────────────────────────
function UserRow({ user }: { user: UserResult }) {
  const [hovered, setHovered] = useState(false);
  const { mutate: followUser, isPending: followPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: unfollowPending } = useUnfollowUser();
  const [following, setFollowing] = useState(false);

  const handleFollow = useCallback(() => {
    setFollowing((f) => !f);
    if (following) {
      unfollowUser(user._id, { onError: () => setFollowing(true) });
    } else {
      followUser(
        { targetId: user._id, targetUser: { displayName: user.displayName, avatarUrl: user.avatarUrl, followerCount: user.followerCount } },
        { onError: () => setFollowing(false) }
      );
    }
  }, [following, user, followUser, unfollowUser]);

  return (
    <div
      data-testid="search-user-result"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
        borderRadius: 8, background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 150ms',
      }}
    >
      <Link href={ROUTES.PROFILE(user.permalink || user._id)} style={{ flexShrink: 0 }}>
        <img
          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=56&h=56&fit=crop'}
          alt={user.displayName}
          style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', background: '#333' }}
        />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={ROUTES.PROFILE(user.permalink || user._id)}
          style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none' }}
        >
          {user.displayName}
        </Link>
        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
          {fmt(user.followerCount)} followers
        </div>
      </div>
      <button
        data-testid="search-follow-button"
        onClick={handleFollow}
        disabled={followPending || unfollowPending}
        style={{
          padding: '6px 18px', borderRadius: 20,
          border: following ? 'none' : '1px solid rgba(255,255,255,0.2)',
          background: following ? 'var(--sc-primary, #ff5500)' : 'transparent',
          color: following ? '#fff' : '#ff5500',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          opacity: (followPending || unfollowPending) ? 0.6 : 1,
        }}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

// ─── Playlist Result Row ──────────────────────────────────────────────────────
function PlaylistRow({ playlist }: { playlist: PlaylistResult }) {
  const [hovered, setHovered] = useState(false);
  const href = playlist.permalink ? ROUTES.TRACK(playlist.permalink) : '#';

  return (
    <div
      data-testid="search-playlist-result"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
        borderRadius: 8, background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 150ms',
      }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0 }}>
        {playlist.artworkUrl && (
          <img src={playlist.artworkUrl} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={href}
          style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {playlist.title}
        </Link>
        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
          by {playlist.owner.displayName}
          {playlist.trackCount ? ` · ${playlist.trackCount} tracks` : ''}
        </div>
      </div>
      <span style={{ fontSize: 11, color: '#555', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>
        Playlist
      </span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function SearchEmpty({ query }: { query: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        No results for &quot;{query}&quot;
      </h2>
      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
        Try a different spelling, or search for an artist, song, or genre.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [activeTab, setActiveTab] = useState<Tab>('tracks');

  const { data: results, isLoading } = useSearch(query);
  const play = usePlayerStore((s) => s.play);

  const tracks = results?.tracks ?? [];
  const users = results?.users ?? [];
  const playlists = results?.playlists ?? [];

  const totalCount = tracks.length + users.length + playlists.length;

  const tabCounts: Record<Tab, number> = {
    tracks: tracks.length,
    people: users.length,
    playlists: playlists.length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'var(--sc-font-family)' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} searchValue={query} />

      <main
        data-testid="search-page"
        style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          {query ? (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Search results for &quot;{query}&quot;
              </h1>
              {!isLoading && (
                <p style={{ color: '#666', fontSize: 13 }}>
                  {totalCount === 0 ? 'No results found' : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
                </p>
              )}
            </>
          ) : (
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Search</h1>
          )}
        </div>

        {/* Tabs */}
        <div
          data-testid="search-tabs"
          style={{
            display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 24,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              data-testid={`search-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                color: activeTab === tab.id ? '#fff' : '#666',
                borderBottom: activeTab === tab.id ? '2px solid #ff5500' : '2px solid transparent',
                transition: 'all 0.15s', fontFamily: 'var(--sc-font-family)',
                marginBottom: -1,
              }}
            >
              {tab.label}
              {!isLoading && tabCounts[tab.id] > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, color: '#555', fontWeight: 400 }}>
                  ({tabCounts[tab.id]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {!query ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎵</div>
            <p style={{ color: '#666', fontSize: 15 }}>
              Search for artists, bands, tracks, podcasts and more.
            </p>
          </div>
        ) : isLoading ? (
          <div data-testid="search-skeleton">
            {[1, 2, 3, 4, 5].map((i) => <ResultSkeleton key={i} />)}
          </div>
        ) : totalCount === 0 ? (
          <SearchEmpty query={query} />
        ) : (
          <div data-testid="search-results">
            {/* Tracks Tab */}
            {activeTab === 'tracks' && (
              <div data-testid="search-tracks-list">
                {tracks.length === 0 ? (
                  <p style={{ color: '#555', fontSize: 14, padding: '24px 0' }}>No tracks found.</p>
                ) : (
                  tracks.map((track) => (
                    <TrackRow
                      key={track._id}
                      track={track}
                      onPlay={() =>
                        play({
                          id: track._id,
                          title: track.title,
                          artist: track.artist.displayName,
                          artworkUrl: track.artworkUrl ?? '',
                          streamUrl: track.hlsUrl ?? '',
                          hlsUrl: track.hlsUrl ?? '',
                          duration: fmtDuration(track.duration),
                          waveform: [],
                          queueContext: 'search',
                        } as any)
                      }
                    />
                  ))
                )}
              </div>
            )}

            {/* People Tab */}
            {activeTab === 'people' && (
              <div data-testid="search-people-list">
                {users.length === 0 ? (
                  <p style={{ color: '#555', fontSize: 14, padding: '24px 0' }}>No people found.</p>
                ) : (
                  users.map((user) => <UserRow key={user._id} user={user} />)
                )}
              </div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <div data-testid="search-playlists-list">
                {playlists.length === 0 ? (
                  <p style={{ color: '#555', fontSize: 14, padding: '24px 0' }}>No playlists found.</p>
                ) : (
                  playlists.map((pl) => <PlaylistRow key={pl._id} playlist={pl} />)
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

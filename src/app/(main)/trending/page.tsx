'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Feature Hooks ────────────────────────────────────────────────────────────
import { useTrending } from '@/features/trending';
import { usePlayerStore } from '@/features/player/model/playerStore';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { TrendingTrack, RankDirection } from '@/features/trending';

// ─── Constants ────────────────────────────────────────────────────────────────
const GENRES = [
  { id: 'all', label: 'All' },
  { id: 'Electronic', label: 'Electronic' },
  { id: 'Hip-Hop', label: 'Hip-Hop' },
  { id: 'Pop', label: 'Pop' },
  { id: 'Rock', label: 'Rock' },
  { id: 'R&B', label: 'R&B' },
  { id: 'Jazz', label: 'Jazz' },
  { id: 'Classical', label: 'Classical' },
];

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

// ─── Rank Change Badge ────────────────────────────────────────────────────────
function RankBadge({ direction, change }: { direction: RankDirection; change?: number }) {
  if (direction === 'new') {
    return (
      <span style={{
        fontSize: 9, fontWeight: 700, color: '#ff5500',
        background: 'rgba(255,85,0,0.12)', borderRadius: 3,
        padding: '2px 5px', letterSpacing: 0.5,
      }}>NEW</span>
    );
  }
  if (direction === 'up' && change) {
    return (
      <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>▲{change}</span>
    );
  }
  if (direction === 'down' && change) {
    return (
      <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>▼{Math.abs(change)}</span>
    );
  }
  return <span style={{ fontSize: 10, color: '#444' }}>—</span>;
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function TrendingSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ width: 28, textAlign: 'right', flexShrink: 0 }}>
        <div style={{ width: 20, height: 14, borderRadius: 3, background: '#252525', marginLeft: 'auto' }} />
      </div>
      <div style={{ width: 56, height: 56, borderRadius: 6, background: '#252525', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '45%', height: 12, borderRadius: 4, background: '#2a2a2a', marginBottom: 8 }} />
        <div style={{ width: '30%', height: 10, borderRadius: 4, background: '#222' }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ─── Trending Track Row ───────────────────────────────────────────────────────
function TrendingRow({
  track,
  onPlay,
  isPlaying,
}: {
  track: TrendingTrack;
  onPlay: () => void;
  isPlaying?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const rankColor = track.rank === 1 ? '#ffd700' : track.rank === 2 ? '#c0c0c0' : track.rank === 3 ? '#cd7f32' : '#555';

  return (
    <div
      data-testid="trending-track-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 16px', borderRadius: 10,
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 150ms',
      }}
    >
      {/* Rank number */}
      <div style={{ width: 28, textAlign: 'right', flexShrink: 0 }}>
        <span style={{
          fontSize: track.rank <= 3 ? 18 : 14,
          fontWeight: 800, color: rankColor,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {track.rank}
        </span>
      </div>

      {/* Artwork + play overlay */}
      <div
        onClick={onPlay}
        style={{
          position: 'relative', width: 56, height: 56,
          borderRadius: 6, overflow: 'hidden',
          background: '#2a2a2a', flexShrink: 0, cursor: 'pointer',
        }}
      >
        {track.artworkUrl && (
          <img src={track.artworkUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {(hovered || isPlaying) && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: isPlaying ? '#ff5500' : 'rgba(255,85,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isPlaying
                ? <div style={{ display: 'flex', gap: 2 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 3, height: 14, background: '#fff', borderRadius: 2,
                        animation: `bar${i} 0.8s ease infinite alternate`,
                      }} />
                    ))}
                  </div>
                : <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="6,4 20,12 6,20" /></svg>
              }
            </div>
          </div>
        )}
      </div>

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={ROUTES.TRACK(track.permalink || track._id)}
          style={{
            fontSize: 14, fontWeight: 600, color: '#fff',
            textDecoration: 'none', display: 'block',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {track.title}
        </Link>
        <Link
          href={ROUTES.PROFILE(track.artist.permalink || track.artist._id)}
          style={{ fontSize: 12, color: '#777', textDecoration: 'none', marginTop: 2, display: 'block' }}
        >
          {track.artist.displayName}
        </Link>
      </div>

      {/* Genre */}
      {track.genre && (
        <span style={{
          fontSize: 11, color: '#666', background: 'rgba(255,255,255,0.06)',
          borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {track.genre}
        </span>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, minWidth: 70 }}>
        <span style={{ fontSize: 12, color: '#888' }}>▶ {fmt(track.playCount)}</span>
        <RankBadge direction={track.rankDirection} change={track.rankChange} />
      </div>

      {/* Duration */}
      <span style={{ fontSize: 12, color: '#555', flexShrink: 0, minWidth: 36, textAlign: 'right' }}>
        {fmtDuration(track.duration)}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrendingPage() {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState('all');

  const { data: tracks = [], isLoading } = useTrending(activeGenre === 'all' ? undefined : activeGenre);
  const play = usePlayerStore((s) => s.play);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const handlePlay = (track: TrendingTrack) => {
    play({
      id: track._id,
      title: track.title,
      artist: track.artist.displayName,
      artworkUrl: track.artworkUrl ?? '',
      streamUrl: track.hlsUrl ?? '',
      hlsUrl: track.hlsUrl ?? '',
      duration: fmtDuration(track.duration),
      waveform: track.waveform ?? [],
    } as any);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'var(--sc-font-family)' }}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main
        data-testid="trending-page"
        style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>🔥</span>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Trending</h1>
          </div>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
            The fastest-rising tracks right now, ranked by engagement velocity.
          </p>
        </div>

        {/* Genre Tabs */}
        <div
          data-testid="trending-genre-tabs"
          style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              data-testid={`trending-genre-${genre.id}`}
              onClick={() => setActiveGenre(genre.id)}
              style={{
                padding: '6px 16px', borderRadius: 20,
                border: activeGenre === genre.id
                  ? '1px solid #ff5500'
                  : '1px solid rgba(255,255,255,0.12)',
                background: activeGenre === genre.id
                  ? 'rgba(255,85,0,0.12)'
                  : 'transparent',
                color: activeGenre === genre.id ? '#ff5500' : '#888',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--sc-font-family)',
              }}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div
          data-testid="trending-chart"
          style={{
            background: '#161616',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Chart header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11, fontWeight: 700, color: '#444',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            <div style={{ width: 28, textAlign: 'right' }}>#</div>
            <div style={{ width: 56 }} />
            <div style={{ flex: 1 }}>Title</div>
            <div>Plays</div>
            <div style={{ minWidth: 36, textAlign: 'right' }}>Time</div>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div data-testid="trending-skeleton">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TrendingSkeleton key={i} />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <p style={{ color: '#555', fontSize: 14 }}>
                No trending tracks for this genre yet. Check back soon.
              </p>
            </div>
          ) : (
            <div data-testid="trending-track-list">
              {tracks.map((track, i) => (
                <div
                  key={track._id}
                  style={{
                    borderBottom: i < tracks.length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : 'none',
                  }}
                >
                  <TrendingRow
                    track={track}
                    onPlay={() => handlePlay(track)}
                    isPlaying={(currentTrack as any)?.id === track._id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Play All button */}
        {!isLoading && tracks.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              data-testid="trending-play-all-button"
              onClick={() => handlePlay(tracks[0])}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 24,
                background: 'var(--sc-primary, #ff5500)',
                border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
                fontFamily: 'var(--sc-font-family)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="6,4 20,12 6,20" /></svg>
              Play All
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

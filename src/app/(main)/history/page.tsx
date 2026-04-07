'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { useHistoryStore } from '@/features/player/model/historyStore';
import { usePlayerStore } from '@/features/player/model/playerStore';
import type { Track } from '@/features/player/model/playerStore';
import s from './History.module.scss';

const LIBRARY_TABS = [
  { label: 'Overview', href: ROUTES.FEED },
  { label: 'Likes', href: ROUTES.LIBRARY_LIKES },
  { label: 'History', href: ROUTES.HISTORY },
];

export default function HistoryPage() {
  const router = useRouter();
  const recentlyPlayed = useHistoryStore((st) => st.recentlyPlayed);
  const listeningHistory = useHistoryStore((st) => st.listeningHistory);
  const clearRecent = useHistoryStore((st) => st.clearRecent);
  const deleteHistoryItem = useHistoryStore((st) => st.deleteHistoryItem);
  const play = usePlayerStore((st) => st.play);

  const [filter, setFilter] = useState('');

  const filteredHistory = useMemo(() => {
    if (!filter.trim()) return listeningHistory;
    const q = filter.toLowerCase();
    return listeningHistory.filter(
      (e) =>
        e.track.title.toLowerCase().includes(q) ||
        e.track.artist.toLowerCase().includes(q)
    );
  }, [listeningHistory, filter]);

  const handlePlay = (track: Track) => {
    play(track);
  };

  // Generate deterministic waveform bars for a track
  const getWaveformBars = (trackId: string) => {
    let seed = 0;
    for (let i = 0; i < trackId.length; i++) seed += trackId.charCodeAt(i);
    return Array.from({ length: 100 }, (_, i) => {
      const val = Math.abs(Math.sin(seed * 0.1 + i * 0.3) * 80) + 10;
      return Math.floor(val);
    });
  };

  return (
    <div className={s.page}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <div className={s.container}>
        {/* Library Tab Bar */}
        <div className={s.tabBar}>
          {LIBRARY_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${s.tab} ${tab.href === ROUTES.HISTORY ? s.tabActive : ''}`}
              data-testid={`library-tab-${tab.label.toLowerCase()}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Recently Played Section */}
        <section data-testid="history-recently-played">
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Recently played:</h2>
            <div className={s.headerActions}>
              {recentlyPlayed.length > 0 && (
                <button
                  className={s.clearBtn}
                  onClick={clearRecent}
                  data-testid="clear-all-history-btn"
                >
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
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>🕐</div>
              <div className={s.emptyTitle}>No recently played tracks</div>
              <div className={s.emptyText}>
                Tracks you listen to will appear here
              </div>
            </div>
          ) : (
            <div className={s.recentGrid}>
              {recentlyPlayed.slice(0, 6).map((track, idx) => (
                <button
                  key={track.id}
                  className={s.recentCard}
                  onClick={() => handlePlay(track)}
                  data-testid={`recent-card-${idx}`}
                >
                  <div className={s.recentThumb}>
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className={s.recentImg}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--sc-bg-dark-elevated)' }} />
                    )}
                    <div className={s.recentOverlay}>
                      <div className={s.playBtn}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span className={s.recentTitle}>{track.title}</span>
                  <span className={s.recentArtist}>{track.artist}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Made For You placeholder (matches SoundCloud screenshot) */}
        {recentlyPlayed.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 className={s.sectionTitle} style={{ marginBottom: 16 }}>
              Made for {/* placeholder */}you
            </h2>
          </section>
        )}

        {/* Full Listening History */}
        <section className={s.historySection} data-testid="history-listening-section">
          <div className={s.historyHeader}>
            <h2 className={s.sectionTitle}>Hear the tracks you&apos;ve played:</h2>
          </div>

          {filteredHistory.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>🎵</div>
              <div className={s.emptyTitle}>No listening history</div>
              <div className={s.emptyText}>
                Tracks you play will be recorded here
              </div>
            </div>
          ) : (
            <div>
              {filteredHistory.map((entry, idx) => {
                const bars = getWaveformBars(entry.track.id);
                const playedAgo = getTimeAgo(entry.playedAt);
                return (
                  <div
                    key={entry.id}
                    className={s.historyTrack}
                    data-testid={`history-track-${idx}`}
                  >
                    <div className={s.historyArtwork}>
                      {entry.track.artworkUrl ? (
                        <img src={entry.track.artworkUrl} alt={entry.track.title} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--sc-bg-dark-elevated)' }} />
                      )}
                    </div>
                    <div className={s.historyInfo}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div>
                          <div className={s.historyTrackArtist}>{entry.track.artist}</div>
                          <div className={s.historyTrackTitle}>{entry.track.title}</div>
                        </div>
                        <span className={s.historyTime}>{playedAgo}</span>
                      </div>
                      <div className={s.historyWaveform}>
                        {bars.map((h, i) => (
                          <div
                            key={i}
                            className={s.waveformBar}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className={s.historyMeta}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlay(entry.track);
                          }}
                          style={{
                            background: 'var(--sc-primary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(entry.id);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid var(--sc-border)',
                            borderRadius: 'var(--sc-radius-md)',
                            color: 'var(--sc-gray-500)',
                            padding: '4px 8px',
                            fontSize: 11,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          data-testid={`history-delete-${idx}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14H7L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

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

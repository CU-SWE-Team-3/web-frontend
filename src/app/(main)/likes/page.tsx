'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { TrackCard } from '@/features/track-engagement/ui/TrackCard';
import type { TrackNode } from '@/features/track-engagement/model/types';
import s from './Likes.module.scss';

const LIBRARY_TABS = [
  { label: 'Overview', href: ROUTES.FEED },
  { label: 'Likes', href: ROUTES.LIBRARY_LIKES },
  { label: 'History', href: ROUTES.HISTORY },
];

type ViewMode = 'grid' | 'list';

export default function LikesPage() {
  const router = useRouter();
  const { data: tracks, isLoading } = useLikedTracks();
  const [view, setView] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState('');

  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    if (!filter.trim()) return tracks;
    const q = filter.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [tracks, filter]);

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
              className={`${s.tab} ${tab.href === ROUTES.LIBRARY_LIKES ? s.tabActive : ''}`}
              data-testid={`library-tab-${tab.label.toLowerCase()}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Section Header */}
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Hear the tracks you&apos;ve liked:</h2>
          <div className={s.headerActions}>
            {/* View Toggle */}
            <span className={s.viewLabel}>View</span>
            <div className={s.viewToggle}>
              <button
                className={`${s.viewBtn} ${view === 'grid' ? s.viewBtnActive : ''}`}
                onClick={() => setView('grid')}
                data-testid="likes-view-grid"
                title="Grid view"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="7" height="7" rx="1" />
                  <rect x="9" y="0" width="7" height="7" rx="1" />
                  <rect x="0" y="9" width="7" height="7" rx="1" />
                  <rect x="9" y="9" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                className={`${s.viewBtn} ${view === 'list' ? s.viewBtnActive : ''}`}
                onClick={() => setView('list')}
                data-testid="likes-view-list"
                title="List view"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="1" width="16" height="2" rx="1" />
                  <rect x="0" y="5" width="16" height="2" rx="1" />
                  <rect x="0" y="9" width="16" height="2" rx="1" />
                  <rect x="0" y="13" width="16" height="2" rx="1" />
                </svg>
              </button>
            </div>

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
          /* Skeleton grid */
          <div className={s.likesGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '1', background: 'var(--sc-bg-dark-elevated)', borderRadius: 'var(--sc-radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>♥</div>
            <div className={s.emptyTitle}>No liked tracks yet</div>
            <div className={s.emptyText}>
              Tracks you like will appear here
            </div>
          </div>
        ) : view === 'grid' ? (
          /* Grid View */
          <div className={s.likesGrid} data-testid="likes-grid">
            {filteredTracks.map((track, idx) => (
              <button
                key={track.id}
                className={s.likeCard}
                data-testid={`like-card-${idx}`}
              >
                <div className={s.likeThumb}>
                  {track.artworkUrl ? (
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      className={s.likeImg}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--sc-bg-dark-elevated)' }} />
                  )}
                  <div className={s.likeOverlay}>
                    <div className={s.playBtn}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </div>
                <span className={s.likeTitle}>
                  <span className={s.likeHeart}>♥</span>
                  {track.title}
                </span>
                <span className={s.likeArtist}>{track.artist}</span>
              </button>
            ))}
          </div>
        ) : (
          /* List View */
          <div className={s.likesList} data-testid="likes-list">
            {filteredTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

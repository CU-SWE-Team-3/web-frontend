'use client';

import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import { SquareTrackCard } from '@/shared/ui';
import { Heart } from 'lucide-react';
import type { TrackNode } from '@/features/track-engagement/model/types';
import s from './Likes.module.scss';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';

const LIBRARY_TABS = [
  { label: 'Overview', href: ROUTES.FEED },
  { label: 'Likes', href: ROUTES.LIBRARY_LIKES },
  { label: 'History', href: ROUTES.HISTORY },
];

export default function LikesPage() {
  const router = useRouter();
  const { data: tracks, isLoading } = useLikedTracks();
  const unlikeMutation = useUnlikeTrack();
  const play = usePlayerStore((st) => st.play);

  const [filter, setFilter] = useState('');

  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    if (!filter.trim()) return tracks;
    const q = filter.toLowerCase();
    return tracks.filter(
      (t: TrackNode) =>
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
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Section Header */}
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Hear the tracks you&apos;ve liked:</h2>
          <div className={s.headerActions}>
            <input
              type="text"
              placeholder="Filter"
              className={s.filterInput}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
        ) : filteredTracks.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>♥</div>
            <div className={s.emptyTitle}>No liked tracks yet</div>
            <div className={s.emptyText}>
              Tracks you like will appear here
            </div>
          </div>
        ) : (
        <div className="flex flex-wrap gap-x-8 gap-y-10 mt-6 pb-24">
          {filteredTracks.map((track) => (
            <SquareTrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist || 'Unknown Artist'}
              artworkUrl={track.artworkUrl}
              onPlay={() => play({
                id: track.id,
                title: track.title,
                artist: track.artist || 'Unknown Artist',
                artworkUrl: track.artworkUrl || '/placeholder.png',
                hlsUrl: (track as any).streamUrl || (track as any).hlsUrl,
              })}
              titlePrefixNode={<Heart size={14} className="fill-[#999] text-[#999]" />}
            />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

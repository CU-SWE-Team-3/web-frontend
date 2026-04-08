'use client';

import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import { FeedTrackCard } from '@/shared/ui/FeedTrackCard/FeedTrackCard';
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
          <div className="flex flex-col gap-6 mt-6 pb-24">
            {filteredTracks.map((track) => (
              <FeedTrackCard
                key={track.id}
                title={track.title}
                artist={track.artist || 'Unknown Artist'}
                coverUrl={track.artworkUrl || undefined}
                plays={track.playCount ?? 0}
                likes={track.likeCount ?? 0}
                reposts={track.repostCount ?? 0}
                comments={track.commentCount ?? 0}
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
    </div>
  );
}

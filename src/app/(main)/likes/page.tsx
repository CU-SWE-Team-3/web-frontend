'use client';

import { useLikedItems } from '@/features/track-engagement/model/useLikedTracks';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import { SquareTrackCard } from '@/shared/ui';
import { PlaylistGridCard } from '@/features/playlists/ui/PlaylistGridCard';
import { Heart } from 'lucide-react';
import type { TrackNode, LikedPlaylistItem } from '@/features/track-engagement/model/types';
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
  const { data: likedData, isLoading } = useLikedItems();
  const likedTracks = likedData?.tracks || [];
  const likedPlaylists = likedData?.playlists || [];
  const unlikeMutation = useUnlikeTrack();
  const play = usePlayerStore((st) => st.play);

  const [filter, setFilter] = useState('');

  const filteredTracks = useMemo(() => {
    if (!filter.trim()) return likedTracks;
    const q = filter.toLowerCase();
    return likedTracks.filter(
      (t: TrackNode) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [likedTracks, filter]);

  const filteredPlaylists = useMemo(() => {
    if (!filter.trim()) return likedPlaylists;
    const q = filter.toLowerCase();
    return likedPlaylists.filter(
      (p: LikedPlaylistItem) => 
        p.title.toLowerCase().includes(q) || 
        (typeof p.creator === 'string' ? p.creator.toLowerCase().includes(q) : p.creator?.displayName?.toLowerCase().includes(q))
    );
  }, [likedPlaylists, filter]);

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
        ) : filteredTracks.length === 0 && filteredPlaylists.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>♥</div>
            <div className={s.emptyTitle}>No liked items yet</div>
            <div className={s.emptyText}>
              Tracks and playlists you like will appear here
            </div>
          </div>
        ) : (
          <div className="pb-24 mt-6">
            {filteredPlaylists.length > 0 && (
              <div className="mb-10">
                <div className={s.subsectionHeader}>
                  <h3 className={s.subsectionTitle}>Liked Playlists</h3>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-10 mt-4">
                  {filteredPlaylists.map((playlist) => (
                    <div key={playlist._id} style={{ width: '180px' }}>
                      <PlaylistGridCard playlist={playlist as any} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTracks.length > 0 && (
              <div>
                <div className={s.subsectionHeader}>
                  <h3 className={s.subsectionTitle}>Liked Tracks</h3>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-10 mt-4">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

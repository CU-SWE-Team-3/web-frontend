'use client';

import { type FC } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { usePlayerStore } from '@/features/player/model/playerStore';
import type { Playlist, ReleaseType, TrackSummary } from '../model/playlist';
import s from './PlaylistGridCard.module.scss';

const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  playlist: 'Playlist',
  album: 'Album',
  ep: 'EP',
  single: 'Single',
};

interface PlaylistGridCardProps {
  playlist: Playlist;
  className?: string;
}

function getCreatorName(creator: Playlist['creator']): string {
  if (typeof creator === 'string') return '';
  return creator.displayName || creator.permalink || '';
}

export const PlaylistGridCard: FC<PlaylistGridCardProps> = ({
  playlist,
  className,
}) => {
  const playContext = usePlayerStore((s) => s.playContext);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!playlist.tracks || playlist.tracks.length === 0) return;
    const resolvedTracks = playlist.tracks.filter(t => typeof t !== 'string').map((t: any) => ({
      id: t._id || t.id,
      title: t.title,
      artist: t.artist?.displayName || t.artist || '',
      artworkUrl: t.artworkUrl || playlist.artworkUrl || '',
      duration: t.duration || 0,
      streamUrl: t.streamUrl || t.hlsUrl || t.audioUrl || '',
      hlsUrl: t.hlsUrl || t.audioUrl || '',
    }));
    
    if (resolvedTracks.length === 0) return;

    playContext(resolvedTracks, 0, {
      type: playlist.releaseType === 'album' ? 'album' : 'playlist',
      id: playlist._id,
      title: playlist.title,
    });
  };

  return (
    <Link
      href={ROUTES.PLAYLIST(playlist._id)}
      className={[s.card, className].filter(Boolean).join(' ')}
      data-testid={`playlist-grid-card-${playlist._id}`}
    >
      <div className={s.cover}>
        {playlist.artworkUrl ? (
          <img
            src={playlist.artworkUrl}
            alt={playlist.title}
            className={s.coverImg}
          />
        ) : (
          <div className={s.coverPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
              <path d="M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
        )}

        {/* Hover play overlay */}
        <div className={s.overlay}>
          <div className={s.playBtn} onClick={handlePlay}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>

        {/* Release type badge */}
        <span className={s.typeBadge}>
          {RELEASE_TYPE_LABELS[playlist.releaseType] || 'Playlist'}
        </span>

        {/* Track count */}
        <span className={s.trackCount}>
          {playlist.trackCount} track{playlist.trackCount !== 1 ? 's' : ''}
        </span>

        {/* Private indicator */}
        {playlist.isPrivate && (
          <span className={s.privateBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
            </svg>
          </span>
        )}
      </div>

      <div className={s.info}>
        <span className={s.title}>{playlist.title}</span>
        <span className={s.creator}>{getCreatorName(playlist.creator)}</span>
      </div>
    </Link>
  );
};

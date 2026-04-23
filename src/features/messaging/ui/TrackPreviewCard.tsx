'use client';

import React from 'react';
import Link from 'next/link';
import type { SharedTrackPreview } from '../model/types';
import s from './MessagesPage.module.scss';

interface TrackPreviewCardProps {
  track: SharedTrackPreview;
}

export const TrackPreviewCard: React.FC<TrackPreviewCardProps> = ({ track }) => {
  return (
    <Link
      href={track.trackUrl}
      className={s.trackPreview}
      data-testid={`track-preview-${track.trackId}`}
    >
      <div className={s.trackPreviewArt}>
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={track.title}
            className={s.trackPreviewArtImg}
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#999">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        )}
      </div>
      <div className={s.trackPreviewInfo}>
        <div className={s.trackPreviewTitle}>{track.title}</div>
        <div className={s.trackPreviewArtist}>{track.artist}</div>
      </div>
      <button
        className={s.trackPreviewPlay}
        onClick={(e) => e.preventDefault()}
        data-testid="track-preview-play"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </Link>
  );
};

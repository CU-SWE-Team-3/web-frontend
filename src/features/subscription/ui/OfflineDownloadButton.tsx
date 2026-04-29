'use client';
// component-id: OfflineDownloadButton_001

import React, { useEffect } from 'react';
import { useOfflineStore } from '@/features/subscription/model/useOfflineStore';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import s from './OfflineDownloadButton.module.scss';

interface OfflineDownloadButtonProps {
  trackId: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration?: number;
  /** Optional: render as icon-only (no text label) */
  iconOnly?: boolean;
}

export const OfflineDownloadButton: React.FC<OfflineDownloadButtonProps> = ({
  trackId,
  title,
  artist,
  artworkUrl,
  duration,
  iconOnly = false,
}) => {
  const { currentPlan } = useSubscriptionStore();
  const { downloadTrack, removeTrack, isDownloaded, hydrate } = useOfflineStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Only visible to Go+ subscribers
  if (currentPlan !== 'Go+') return null;

  const downloaded = isDownloaded(trackId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloaded) {
      removeTrack(trackId);
    } else {
      downloadTrack({ id: trackId, title, artist, artworkUrl, duration });
    }
  };

  return (
    <button
      className={`${s.btn} ${downloaded ? s.downloaded : s.available}`}
      onClick={handleClick}
      aria-label={downloaded ? `Remove "${title}" from offline library` : `Download "${title}" for offline listening`}
      title={downloaded ? 'Remove from offline' : 'Download for offline'}
      data-testid={`offline-download-${trackId}`}
    >
      {downloaded ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          {!iconOnly && <span>Offline</span>}
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          {!iconOnly && <span>Download</span>}
        </>
      )}
    </button>
  );
};

'use client';
// component-id: OfflineLibrary_001

import React from 'react';
import { useOfflineStore } from '@/features/subscription/model/useOfflineStore';
import s from './OfflineLibrary.module.scss';

export const OfflineLibrary: React.FC = () => {
  const { downloadedTracks, removeTrack, clearAll } = useOfflineStore();

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (downloadedTracks.length === 0) {
    return (
      <div className={s.emptyState} data-testid="offline-library-empty">
        <div className={s.emptyIcon}>📥</div>
        <h3 className={s.emptyTitle}>No offline tracks yet</h3>
        <p className={s.emptyText}>
          Download tracks while online to listen without an internet connection.
          Look for the download icon on any track.
        </p>
      </div>
    );
  }

  return (
    <div className={s.container} data-testid="offline-library">
      <div className={s.header}>
        <h2 className={s.title}>Downloaded ({downloadedTracks.length})</h2>
        <button className={s.clearBtn} onClick={clearAll} data-testid="offline-clear-all">
          Clear all
        </button>
      </div>

      <div className={s.trackList}>
        {downloadedTracks.map((track) => (
          <div key={track.id} className={s.trackCard} data-testid={`offline-track-${track.id}`}>
            {track.artworkUrl ? (
              <img src={track.artworkUrl} alt={track.title} className={s.artwork} />
            ) : (
              <div className={s.artworkPlaceholder}>🎵</div>
            )}

            <div className={s.trackInfo}>
              <p className={s.trackTitle}>{track.title}</p>
              <p className={s.trackArtist}>{track.artist}</p>
              <p className={s.trackDate}>Downloaded {formatDate(track.downloadedAt)}</p>
            </div>

            <span className={s.offlineBadge}>
              ✓ Offline
            </span>

            <button
              className={s.removeBtn}
              onClick={() => removeTrack(track.id)}
              aria-label={`Remove ${track.title} from offline library`}
              data-testid={`offline-remove-${track.id}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

'use client';

import { type FC, useState, useCallback } from 'react';
import type { Playlist, TrackSummary } from '../model/playlist';
import s from './PlaylistDetailHeader.module.scss';

interface PlaylistDetailHeaderProps {
  playlist: Playlist;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onArtworkUpload: (file: File) => void;
  isUploadingArtwork?: boolean;
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function getCreatorDisplayName(creator: Playlist['creator']): string {
  if (typeof creator === 'string') return creator;
  return creator.displayName || creator.permalink || 'Unknown';
}

function getCreatorAvatar(creator: Playlist['creator']): string | null {
  if (typeof creator === 'string') return null;
  return creator.avatarUrl;
}

function getCreatorPermalink(creator: Playlist['creator']): string {
  if (typeof creator === 'string') return creator;
  return creator.permalink || '';
}

const RELEASE_TYPE_LABELS: Record<string, string> = {
  playlist: 'Playlist',
  album: 'Album',
  ep: 'EP',
  single: 'Single',
};

export const PlaylistDetailHeader: FC<PlaylistDetailHeaderProps> = ({
  playlist,
  isOwner,
  onEdit,
  onDelete,
  onShare,
  onArtworkUpload,
  isUploadingArtwork,
}) => {
  const [secretCopied, setSecretCopied] = useState(false);

  const handleCopySecretLink = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/playlist/${playlist._id}?secretToken=${playlist.secretToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    });
  }, [playlist._id, playlist.secretToken]);

  const handleArtworkClick = () => {
    if (!isOwner) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.onchange = () => {
      if (input.files?.[0]) onArtworkUpload(input.files[0]);
    };
    input.click();
  };

  const creatorName = getCreatorDisplayName(playlist.creator);
  const creatorAvatar = getCreatorAvatar(playlist.creator);
  const creatorPermalink = getCreatorPermalink(playlist.creator);

  return (
    <div className={s.header} data-testid="playlist-detail-header">
      {/* Artwork */}
      <div
        className={`${s.artwork} ${isOwner ? s.artworkEditable : ''}`}
        onClick={handleArtworkClick}
        data-testid="playlist-artwork"
      >
        {playlist.artworkUrl ? (
          <img src={playlist.artworkUrl} alt={playlist.title} className={s.artworkImg} />
        ) : (
          <div className={s.artworkPlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        {isOwner && (
          <div className={s.artworkOverlay}>
            {isUploadingArtwork ? (
              <span className={s.artworkSpinner} />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload artwork</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={s.info}>
        <div className={s.topRow}>
          <span className={s.releaseTypeBadge} data-testid="playlist-release-type">
            {RELEASE_TYPE_LABELS[playlist.releaseType] || 'Playlist'}
          </span>
          {playlist.isPrivate && (
            <span className={s.privateBadge} data-testid="playlist-private-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
              </svg>
              Private
            </span>
          )}
        </div>

        <h1 className={s.title} data-testid="playlist-title">{playlist.title}</h1>

        <div className={s.creator} data-testid="playlist-creator">
          {creatorAvatar && (
            <img src={creatorAvatar} alt={creatorName} className={s.creatorAvatar} />
          )}
          <a href={`/profile/${creatorPermalink}`} className={s.creatorName}>
            {creatorName}
          </a>
        </div>

        {/* Stats Row */}
        <div className={s.stats}>
          <span className={s.stat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            {playlist.trackCount} track{playlist.trackCount !== 1 ? 's' : ''}
          </span>
          <span className={s.statDot}>·</span>
          <span className={s.stat}>{formatDuration(playlist.totalDuration || 0)}</span>
          {(playlist.playCount ?? 0) > 0 && (
            <>
              <span className={s.statDot}>·</span>
              <span className={s.stat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {playlist.playCount.toLocaleString()}
              </span>
            </>
          )}
          {(playlist.likeCount ?? 0) > 0 && (
            <>
              <span className={s.statDot}>·</span>
              <span className={s.stat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {playlist.likeCount.toLocaleString()}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className={s.actionButtons}>
          <button className={s.shareBtn} onClick={onShare} data-testid="playlist-share-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>

          {isOwner && (
            <>
              <button className={s.editBtn} onClick={onEdit} data-testid="playlist-edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button className={s.deleteBtn} onClick={onDelete} data-testid="playlist-delete-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14H7L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>

        {/* Secret Link (private playlists owned by the user) */}
        {isOwner && playlist.isPrivate && playlist.secretToken && (
          <div className={s.secretLinkRow} data-testid="playlist-secret-link">
            <span className={s.secretLabel}>Secret link:</span>
            <button className={s.copySecretBtn} onClick={handleCopySecretLink}>
              {secretCopied ? '✓ Copied!' : 'Copy secret link'}
            </button>
          </div>
        )}

        {/* Description */}
        {playlist.description && (
          <p className={s.description} data-testid="playlist-description">
            {playlist.description}
          </p>
        )}

        {/* Meta Row */}
        <div className={s.metaRow}>
          {playlist.genre && (
            <span className={s.metaTag} data-testid="playlist-genre">{playlist.genre}</span>
          )}
          {(playlist.tags || []).map((tag) => (
            <span key={tag} className={s.metaTag}>#{tag}</span>
          ))}
          {playlist.releaseDate && (
            <span className={s.metaDate}>
              Released: {new Date(playlist.releaseDate).toLocaleDateString()}
            </span>
          )}
          {playlist.labelName && (
            <span className={s.metaDate}>Label: {playlist.labelName}</span>
          )}
        </div>
      </div>
    </div>
  );
};

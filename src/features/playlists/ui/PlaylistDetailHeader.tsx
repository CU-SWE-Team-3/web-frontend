'use client';

import { type FC, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Playlist } from '../model/playlist';
import s from './PlaylistDetailHeader.module.scss';
import { formatDistanceToNow } from 'date-fns';
import { 
  useLikePlaylist, 
  useUnlikePlaylist, 
  useRepostPlaylist, 
  useUnrepostPlaylist 
} from '../model/playlistQueries';

interface PlaylistDetailHeaderProps {
  playlist: Playlist;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onArtworkUpload: (file: File) => void;
  onPlay: () => void;
  isUploadingArtwork?: boolean;
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getCreatorDisplayName(creator: Playlist['creator']): string {
  if (typeof creator === 'string') {
    return /^[0-9a-fA-F]{24}$/.test(creator) ? 'Unknown creator' : creator;
  }
  return creator.displayName || creator.permalink || 'Unknown';
}

function getCreatorAvatar(creator: Playlist['creator']): string | null {
  if (typeof creator === 'string') return null;
  return creator.avatarUrl;
}

function getCreatorPermalink(creator: Playlist['creator']): string {
  if (typeof creator === 'string') {
    return /^[0-9a-fA-F]{24}$/.test(creator) ? '' : creator;
  }
  return creator.permalink || '';
}

export const PlaylistDetailHeader: FC<PlaylistDetailHeaderProps> = ({
  playlist,
  isOwner,
  onEdit,
  onDelete,
  onShare,
  onArtworkUpload,
  onPlay,
  isUploadingArtwork,
}) => {
  const [secretCopied, setSecretCopied] = useState(false);

  const likeMutation = useLikePlaylist();
  const unlikeMutation = useUnlikePlaylist();
  const repostMutation = useRepostPlaylist();
  const unrepostMutation = useUnrepostPlaylist();

  const handleLike = useCallback(() => {
    if (playlist.isLiked) {
      unlikeMutation.mutate(playlist._id);
    } else {
      likeMutation.mutate(playlist._id);
    }
  }, [playlist._id, playlist.isLiked, likeMutation, unlikeMutation]);

  const handleRepost = useCallback(() => {
    if (playlist.isReposted) {
      unrepostMutation.mutate(playlist._id);
    } else {
      repostMutation.mutate(playlist._id);
    }
  }, [playlist._id, playlist.isReposted, repostMutation, unrepostMutation]);

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

  const actualTrackCount = Array.isArray(playlist.tracks)
    ? playlist.tracks.length
    : playlist.trackCount || 0;

  // Render a gradient similar to the screenshot based on the image, but we'll use a CSS class
  // SC has dynamic gradients, but we'll use a standard olive one for now.
  
  return (
    <div className={s.headerContainer} data-testid="playlist-detail-header">
      
      {/* ─── Top Hero Banner ─── */}
      <div className={s.heroBanner}>
        <div className={s.heroLeft}>
          <div className={s.heroTopRow}>
            {/* Play Button */}
            <button
              className={s.playBtn}
              onClick={onPlay}
              data-testid="playlist-header-play-btn"
              type="button"
              aria-label="Play playlist"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>

            {/* Title & Creator Block */}
            <div className={s.titleBlock}>
              <h1 className={s.title}>
                <span className={s.titleText} data-testid="playlist-title">
                  {playlist.title}
                </span>
              </h1>
              <div className={s.creatorLine}>
                <Link href={`/profile/${creatorPermalink}`} className={s.creatorLink}>
                  <span data-testid="playlist-header-creator-name">{creatorName}</span>
                </Link>
              </div>
            </div>

            {/* Updated Date */}
            {playlist.updatedAt && (
              <div className={s.updatedDate}>
                Updated {formatDistanceToNow(new Date(playlist.updatedAt))} ago
              </div>
            )}
          </div>

          {/* Bottom Left Stats Circle */}
          <div className={s.statsCircle}>
            <span className={s.statsNumber} data-testid="playlist-header-track-count">{actualTrackCount}</span>
            <span className={s.statsLabel}>TRACKS</span>
            <span className={s.statsDuration}>{formatDuration(playlist.totalDuration || 0)}</span>
          </div>
        </div>

        <div className={s.heroRight}>
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
            
            {/* "Replace image" overlay block */}
            {isOwner && (
              <div className={s.replaceImageOverlay}>
                 {isUploadingArtwork ? (
                    <span className={s.artworkSpinner} />
                 ) : (
                    <span className={s.replaceImageText}>Replace image</span>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Actions & Details ─── */}
      <div className={s.bottomSection}>
        {/* Action Buttons Row */}
        <div className={s.actionRow}>
          <div className={s.mainActions}>
            <button 
              className={`${s.actionBtn} ${playlist.isLiked ? s.actionBtnActive : ''}`} 
              onClick={handleLike}
              data-testid="playlist-like-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={playlist.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {playlist.isLiked ? 'Liked' : 'Like'}
            </button>

            <button 
              className={`${s.actionBtn} ${playlist.isReposted ? s.actionBtnActive : ''}`} 
              onClick={handleRepost}
              data-testid="playlist-repost-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
              {playlist.isReposted ? 'Reposted' : 'Repost'}
            </button>

            <button className={s.actionBtn} onClick={onShare} data-testid="playlist-share-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
            <button className={s.actionBtn} onClick={handleCopySecretLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path>
              </svg>
              {secretCopied ? 'Copied!' : 'Copy Link'}
            </button>

            {isOwner && (
              <>
                <button className={s.actionBtn} onClick={onEdit} data-testid="playlist-edit-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button className={s.actionBtn} onClick={onDelete} data-testid="playlist-delete-btn">
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
          
          <div className={s.rightActions}>
             {/* E.g. view counts could go here */}
          </div>
        </div>

        {/* Details Row */}
        <div className={s.detailsRow}>
          <div className={s.sidebar}>
            {creatorAvatar ? (
              <img src={creatorAvatar} alt={creatorName} className={s.sidebarAvatar} data-testid="playlist-header-creator-avatar" />
            ) : (
              <div className={s.sidebarAvatarPlaceholder} data-testid="playlist-header-creator-avatar-placeholder" />
            )}
            <Link href={`/profile/${creatorPermalink}`} className={s.sidebarCreatorName}>
              <span data-testid="playlist-header-sidebar-creator-name">{creatorName}</span>
            </Link>
          </div>

          <div className={s.mainContent}>
            {/* Description & Tags */}
            <div className={s.descriptionBox}>
              {(playlist.genre || (playlist.tags && playlist.tags.length > 0)) && (
                <div className={s.tagsRow}>
                  {playlist.genre && (
                    <span className={s.tagElement}>#{playlist.genre}</span>
                  )}
                  {(playlist.tags || []).map((tag) => (
                    <span key={tag} className={s.tagElement}>#{tag}</span>
                  ))}
                </div>
              )}
              {playlist.description && (
                <div className={s.descriptionText}>
                  {playlist.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

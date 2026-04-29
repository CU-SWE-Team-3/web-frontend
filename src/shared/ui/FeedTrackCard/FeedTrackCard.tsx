'use client';

import { type FC, type ReactNode } from 'react';
import s from './FeedTrackCard.module.scss';
import Link from 'next/link';

export interface FeedTrackCardProps {
  title: string;
  artist: string;
  artistPermalink?: string;
  trackPermalink?: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  liked?: boolean;
  waveformSlot?: ReactNode;
  actionsSlot?: ReactNode;
  onPlay?: () => void;
  className?: string;
  audioUrl?: string;   // kept for backwards compat with history/library pages
  
  // Header Props
  reposterName?: string;
  reposterAvatarUrl?: string;
  reposterPermalink?: string;
  actionType?: 'reposted a track' | 'posted a track';
  repostTime?: string;
  
  // Comment Bar Props
  currentUserAvatarUrl?: string;
}

function fmt(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const FeedTrackCard: FC<FeedTrackCardProps> = ({
  title, artist, artistPermalink, trackPermalink, coverUrl, plays, likes, reposts, comments,
  waveformSlot, actionsSlot, onPlay, className,
  reposterName, reposterAvatarUrl, reposterPermalink, actionType = 'posted a track', repostTime,
  currentUserAvatarUrl
}) => {
  return (
    <div data-testid="track-card" className={[s.card, className].filter(Boolean).join(' ')}>
      
      {/* ─── Header: Repost / Post info ─── */}
      {(reposterName || actionType) && (
        <div className={s.headerRow}>
          <div className={s.reposterInfo}>
            <Link href={`/profile/${reposterPermalink || '#'}`} className={s.reposterAvatarWrap}>
              <img 
                src={reposterAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'} 
                alt={reposterName} 
                className={s.reposterAvatar}
              />
            </Link>
            <span className={s.headerText}>
              <Link href={`/profile/${reposterPermalink || '#'}`} className={s.reposterName}>{reposterName || artist}</Link>
              {' '}
              <span className={s.actionType}>{actionType}</span>
              {' '}
              {repostTime && <span className={s.repostTime}>{repostTime}</span>}
            </span>
          </div>
        </div>
      )}

      {/* ─── Main Body ─── */}
      <div className={s.mainBody}>
        
        {/* Left: Square Artwork */}
        <div className={s.artworkWrapper} onClick={onPlay}>
          {coverUrl && coverUrl !== 'undefined' && coverUrl !== 'null' ? (
            <img data-testid="track-card-artwork" className={s.artworkImg} src={coverUrl} alt={title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className={s.artworkImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
          )}
        </div>

        {/* Right: Content */}
        <div className={s.contentArea}>
          
          {/* Top: Play Button + Titles */}
          <div className={s.titleRow}>
            <button className={s.playBtn} onClick={onPlay} aria-label="Play">
              <span className={s.playTriangle} />
            </button>
            <div className={s.titleInfo}>
              <Link href={`/profile/${artistPermalink || '#'}`} className={s.artistName}>{artist}</Link>
              <Link href={`/tracks/${trackPermalink || '#'}`} data-testid="track-card-title" className={s.trackTitle}>{title}</Link>
            </div>
            {/* Genre tag if exists could go here */}
          </div>

          {/* Middle: Waveform */}
          <div data-testid="track-card-waveform" className={s.waveformContainer}>
            {waveformSlot}
          </div>

          {/* Bottom 1: Comment Bar */}
          <div className={s.commentBar}>
            <img 
              src={currentUserAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'} 
              className={s.commentAvatar} 
              alt="You" 
            />
            <div className={s.commentInputWrap}>
              <input type="text" placeholder="Write a comment" className={s.commentInput} />
              <button className={s.commentSubmitBtn}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>

          {/* Bottom 2: Action Buttons & Stats */}
          <div className={s.actionRow}>
            <div className={s.actionsLeft}>
               {actionsSlot}
            </div>
            <div className={s.statsRight}>
              {plays !== undefined && <span data-testid="track-card-plays" className={s.statText}>▶ {fmt(plays)}</span>}
              {comments !== undefined && <span data-testid="track-card-comments" className={s.statText}>💬 {fmt(comments)}</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

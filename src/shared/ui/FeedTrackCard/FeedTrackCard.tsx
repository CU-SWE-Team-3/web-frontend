'use client';

import { type FC, type ReactNode, Suspense, lazy } from 'react';
import s from './FeedTrackCard.module.scss';

const WaveformPlayer = lazy(() => import('@/features/tracks/ui/WaveformPlayer'));

export interface FeedTrackCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  liked?: boolean;
  audioUrl?: string;
  waveformSlot?: ReactNode;
  actionsSlot?: ReactNode;
  onPlay?: () => void;
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const FeedTrackCard: FC<FeedTrackCardProps> = ({
  title, artist, coverUrl, timeAgo, plays, likes, reposts, comments,
  liked, audioUrl, waveformSlot, actionsSlot, onPlay, className,
}) => (
  <div data-testid="track-card" className={[s.card, className].filter(Boolean).join(' ')}>
    <div className={s.coverWrap}>
      {coverUrl ? (
        <img data-testid="track-card-artwork" className={s.coverImg} src={coverUrl} alt={title} />
      ) : (
        <div className={s.coverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
      )}
      <button className={s.playBtn} onClick={onPlay} aria-label="Play">
        <span className={s.playTriangle} />
      </button>
    </div>

    <div className={s.body}>
      <div className={s.header}>
        <div className={s.meta}>
          <span className={s.artist}>{artist}</span>
          <span data-testid="track-card-title" className={s.title}>{title}</span>
        </div>
        {timeAgo && <span className={s.time}>{timeAgo}</span>}
      </div>

      <div data-testid="track-card-waveform" className={s.waveform}>
        {waveformSlot || (audioUrl ? (
          <Suspense fallback={<div style={{ height: 80, background: '#222' }} />}>
            <WaveformPlayer audioUrl={audioUrl} />
          </Suspense>
        ) : null)}
      </div>

      <div className={s.footer}>
        <div className={s.stats}>
          {likes !== undefined && (
            <span data-testid="track-card-likes" className={`${s.stat} ${liked ? s.statActive : ''}`}>♥ {fmt(likes)}</span>
          )}
          {reposts !== undefined && <span data-testid="track-card-reposts" className={s.stat}>↻ {fmt(reposts)}</span>}
          {plays !== undefined && <span data-testid="track-card-plays" className={s.stat}>▶ {fmt(plays)}</span>}
          {comments !== undefined && <span data-testid="track-card-comments" className={s.stat}>💬 {fmt(comments)}</span>}
        </div>
        {actionsSlot}
      </div>
    </div>
  </div>
);

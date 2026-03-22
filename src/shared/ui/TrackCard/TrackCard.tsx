'use client';

import { type FC, type MouseEventHandler, useMemo } from 'react';
import s from './TrackCard.module.scss';

export interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
  duration: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  liked?: boolean;
  isPlaying?: boolean;
  onPlay?: MouseEventHandler<HTMLButtonElement>;
  onLike?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Generate deterministic waveform bars from the title string */
function generateBars(seed: string, count: number = 48): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 16807 + 0x7fffffff) & 0x7fffffff;
    bars.push(0.15 + (hash % 100) / 120);
  }
  return bars;
}

export const TrackCard: FC<TrackCardProps> = ({
  title, artist, coverUrl, duration,
  plays = 0, likes = 0, reposts, liked = false, isPlaying = false,
  onPlay, onLike, className,
}) => {
  const bars = useMemo(() => generateBars(title), [title]);

  return (
    <div data-testid="track-card" className={[s.card, className].filter(Boolean).join(' ')}>
      {/* Play / Pause button */}
      <button data-testid="track-card-play-button" className={s.playBtn} onClick={onPlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <span className={s.pauseIcon} data-testid="track-card-pause-icon">
            <span className={s.pauseBar} />
            <span className={s.pauseBar} />
          </span>
        ) : (
          <span className={s.playTriangle} data-testid="track-card-play-icon" />
        )}
      </button>

      {/* Cover art */}
      <div className={s.artWrap}>
        {coverUrl ? (
          <img data-testid="track-card-artwork" className={s.artImg} src={coverUrl} alt={title} />
        ) : (
          <div className={s.artImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
        )}
      </div>

      {/* Meta */}
      <div className={s.meta}>
        <span data-testid="track-card-title" className={s.title}>{title}</span>
        <span className={s.artist}>{artist}</span>
      </div>

      {/* Waveform */}
      <div data-testid="track-card-waveform" className={s.waveform}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={s.bar}
            style={{
              height: `${h * 100}%`,
              background: i < bars.length * 0.3 && isPlaying
                ? 'var(--sc-waveform-progress)'
                : 'var(--sc-waveform)',
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className={s.stats}>
        <span className={s.stat}>{duration}</span>
        <button
          data-testid="track-card-like-button"
          className={`${s.likeBtn} ${liked ? s.liked : ''}`}
          onClick={onLike}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? '♥' : '♡'} {formatCount(likes)}
        </button>
        {reposts !== undefined && (
          <span className={s.stat} data-testid="track-card-reposts">↻ {formatCount(reposts)}</span>
        )}
        <span className={s.stat} data-testid="track-card-plays">▶ {formatCount(plays)}</span>
      </div>
    </div>
  );
};

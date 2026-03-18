'use client';

import { type FC, type MouseEventHandler } from 'react';
import s from './PlayerBar.module.scss';

export interface PlayerBarProps {
  title?: string;
  artist?: string;
  coverUrl?: string;
  isPlaying?: boolean;
  liked?: boolean;
  currentTime?: number;
  totalTime?: number;
  volume?: number;
  shuffle?: boolean;
  repeat?: boolean;
  onPlayPause?: MouseEventHandler<HTMLButtonElement>;
  onPrev?: MouseEventHandler<HTMLButtonElement>;
  onNext?: MouseEventHandler<HTMLButtonElement>;
  onLike?: MouseEventHandler<HTMLButtonElement>;
  onVolumeChange?: (v: number) => void;
  onSeek?: (pct: number) => void;
  onShuffle?: MouseEventHandler<HTMLButtonElement>;
  onRepeat?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const ss = Math.floor(sec % 60);
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export const PlayerBar: FC<PlayerBarProps> = ({
  title = '—',
  artist = '—',
  coverUrl,
  isPlaying = false,
  liked = false,
  currentTime = 0,
  totalTime = 0,
  volume = 80,
  shuffle = false,
  repeat = false,
  onPlayPause, onPrev, onNext, onLike,
  onVolumeChange, onSeek, onShuffle, onRepeat,
  className,
}) => {
  const pct = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <div className={[s.bar, className].filter(Boolean).join(' ')}>
      {/* ---- Left ---- */}
      <div className={s.left}>
        <div className={s.coverArt}>
          {coverUrl ? (
            <img className={s.coverImg} src={coverUrl} alt={title} />
          ) : (
            <div className={s.coverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
          )}
        </div>
        <div className={s.trackInfo}>
          <span className={s.trackTitle}>{title}</span>
          <span className={s.trackArtist}>{artist}</span>
        </div>
        <button
          className={`${s.heartBtn} ${liked ? s.heartLiked : ''}`}
          onClick={onLike}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? '♥' : '♡'}
        </button>
      </div>

      {/* ---- Center ---- */}
      <div className={s.center}>
        <div className={s.controls}>
          <button className={`${s.toggleBtn} ${shuffle ? s.toggleActive : ''}`} onClick={onShuffle} aria-label="Shuffle">⇌</button>
          <button className={s.ctrlBtn} onClick={onPrev} aria-label="Previous">⏮</button>
          <button className={s.playPauseBtn} onClick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <span className={s.pauseIcon}><span className={s.pauseBar} /><span className={s.pauseBar} /></span>
            ) : (
              <span className={s.playTriangle} />
            )}
          </button>
          <button className={s.ctrlBtn} onClick={onNext} aria-label="Next">⏭</button>
          <button className={`${s.toggleBtn} ${repeat ? s.toggleActive : ''}`} onClick={onRepeat} aria-label="Repeat">🔁</button>
        </div>
        <div className={s.progressRow}>
          <span className={s.time}>{fmtTime(currentTime)}</span>
          <div
            className={s.progressTrack}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onSeek?.((e.clientX - rect.left) / rect.width);
            }}
          >
            <div className={s.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={s.time}>{fmtTime(totalTime)}</span>
        </div>
      </div>

      {/* ---- Right ---- */}
      <div className={s.right}>
        <div className={s.volumeWrap}>
          <button className={s.volumeIcon} aria-label="Volume">🔊</button>
          <input
            className={s.volumeSlider}
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolumeChange?.(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};

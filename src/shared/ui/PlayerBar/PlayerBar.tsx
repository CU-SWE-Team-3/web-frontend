'use client';

import { type FC } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Heart, ListPlus, Maximize2,
} from 'lucide-react';
import { SeekBar } from '@/features/player/ui/player/SeekBar';
import { VolumeControl } from '@/features/player/ui/player/VolumeControl';
import { formatTime } from '@/features/player/lib/playbackUtils';
import s from './PlayerBar.module.scss';

export interface PlayerBarProps {
  track?: {
    id: string;
    title: string;
    artist: string;
    artworkUrl: string;
  } | null;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  buffered?: number;
  volume?: number;
  isMuted?: boolean;
  isLiked?: boolean;
  onPlayPause?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (level: number) => void;
  onToggleMute?: () => void;
  onLike?: () => void;
  onAddToPlaylist?: () => void;
  onExpand?: () => void;
}

export const PlayerBar: FC<PlayerBarProps> = ({
  track,
  isPlaying   = false,
  currentTime = 0,
  duration    = 0,
  buffered    = 0,
  volume      = 0.8,
  isMuted     = false,
  isLiked     = false,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onLike,
  onAddToPlaylist,
  onExpand,
}) => {
  if (!track) return null;

  return (
    <div id="sc-player-bar" className={s.bar} data-testid="player-bar">

      {/* ── LEFT: thumbnail + track info + like ── */}
      <div className={s.left}>
        <div className={s.coverArt}>
          <img src={track.artworkUrl} alt={track.title} className={s.coverImg} />
        </div>

        {/* Desktop: stacked title + artist */}
        <div className={s.trackInfo}>
          <span className={s.trackTitle}>{track.title}</span>
          <span className={s.trackArtist}>{track.artist}</span>
        </div>

        {/* Mobile: single-line title */}
        <span className={s.mobileTitle}>{track.title}</span>

        <button
          onClick={onLike}
          className={`${s.heartBtn} ${isLiked ? s.heartLiked : ''}`}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── CENTER: transport controls + seek bar ── */}
      <div className={s.center}>
        <div className={s.controls}>
          <button id="sc-btn-prev" onClick={onPrev} className={s.ctrlBtn} aria-label="Previous track">
            <SkipBack size={16} fill="currentColor" />
          </button>

          <button
            id="sc-btn-play-pause"
            onClick={onPlayPause}
            className={s.playPauseBtn}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause size={16} fill="white" />
              : <Play  size={16} fill="white" style={{ marginLeft: 2 }} />
            }
          </button>

          <button id="sc-btn-next" onClick={onNext} className={s.ctrlBtn} aria-label="Next track">
            <SkipForward size={16} fill="currentColor" />
          </button>
        </div>

        {/* Seek bar row — hidden on mobile */}
        <div className={s.seekRow}>
          <span id="sc-time-display" className={s.time}>{formatTime(currentTime)}</span>
          <div className={s.seekWrap}>
            <SeekBar
              currentTime={currentTime}
              duration={duration}
              buffered={buffered}
              onSeek={onSeek ?? (() => {})}
            />
          </div>
          <span className={s.time}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* ── RIGHT: volume + actions — hidden on mobile ── */}
      <div className={s.right}>
        <button onClick={onAddToPlaylist} className={s.iconBtn} aria-label="Add to playlist">
          <ListPlus size={16} />
        </button>

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange ?? (() => {})}
          onToggleMute={onToggleMute ?? (() => {})}
        />

        <button id="sc-btn-expand" onClick={onExpand} className={s.iconBtn} aria-label="Expand player">
          <Maximize2 size={16} />
        </button>
      </div>

    </div>
  );
};
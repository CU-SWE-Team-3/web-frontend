'use client';

import { type FC, useRef, useState, useCallback } from 'react';
import { formatTime } from '../../lib/playbackUtils';
import s from './SeekBar.module.scss';

export interface SeekBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

export const SeekBar: FC<SeekBarProps> = ({ currentTime, duration, buffered, onSeek }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState(0);

  const playedPct   = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? buffered * 100 : 0;

  const getPercent = (e: React.MouseEvent) => {
    if (!trackRef.current) return 0;
    const { left, width } = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - left) / width));
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setHoverX(x);
    setHoverTime(Math.max(0, Math.min(1, x / rect.width)) * duration);
  }, [duration]);

  const handleMouseLeave = useCallback(() => setHoverX(null), []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    onSeek(getPercent(e) * duration);
  }, [duration, onSeek]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') onSeek(Math.min(currentTime + 5, duration));
    if (e.key === 'ArrowLeft')  onSeek(Math.max(currentTime - 5, 0));
  }, [currentTime, duration, onSeek]);

  return (
    <div id="sc-seekbar" className={s.root}>
      <div
        ref={trackRef}
        className={s.track}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
      >
        <div className={s.buffered} style={{ width: `${bufferedPct}%` }} />
        <div className={s.played}   style={{ width: `${playedPct}%` }} />
        <div className={s.thumb}    style={{ left: `${playedPct}%` }} />
      </div>

      {hoverX !== null && (
        <div id="sc-seekbar-tooltip" className={s.tooltip} style={{ left: hoverX }}>
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};

'use client';

import { type FC, useRef, useState, useCallback, useEffect } from 'react';
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
  const isDragging = useRef(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState(0);
  const [dragPct, setDragPct] = useState<number | null>(null);

  // Use drag percent for visual display while dragging, otherwise use real currentTime
  const playedPct   = dragPct !== null ? dragPct : (duration > 0 ? (currentTime / duration) * 100 : 0);
  const bufferedPct = duration > 0 ? buffered * 100 : 0;

  const getPctFromEvent = (clientX: number): number => {
    if (!trackRef.current) return 0;
    const { left, width } = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - left) / width));
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setHoverX(x);
    setHoverTime(Math.max(0, Math.min(1, x / rect.width)) * duration);
  }, [duration]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging.current) setHoverX(null);
  }, []);

  // Drag: mousedown starts drag, document listeners handle move/up
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    e.preventDefault();
    isDragging.current = true;

    const initialPct = getPctFromEvent(e.clientX);
    setDragPct(initialPct * 100);

    const handleDragMove = (me: MouseEvent) => {
      const pct = getPctFromEvent(me.clientX);
      setDragPct(pct * 100);
      // Also update hover tooltip
      if (trackRef.current) {
        const { left } = trackRef.current.getBoundingClientRect();
        setHoverX(me.clientX - left);
        setHoverTime(pct * duration);
      }
    };

    const handleDragUp = (me: MouseEvent) => {
      isDragging.current = false;
      setDragPct(null);
      setHoverX(null);
      const pct = getPctFromEvent(me.clientX);
      onSeek(pct * duration);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragUp);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragUp);
  }, [duration, onSeek]);

  // Touch drag support (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    e.preventDefault();
    isDragging.current = true;

    const touch = e.touches[0];
    const initialPct = getPctFromEvent(touch.clientX);
    setDragPct(initialPct * 100);

    const handleTouchMove = (te: TouchEvent) => {
      const t = te.touches[0];
      const pct = getPctFromEvent(t.clientX);
      setDragPct(pct * 100);
    };

    const handleTouchEnd = (te: TouchEvent) => {
      isDragging.current = false;
      setDragPct(null);
      const t = te.changedTouches[0];
      const pct = getPctFromEvent(t.clientX);
      onSeek(pct * duration);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [duration, onSeek]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') onSeek(Math.min(currentTime + 5, duration));
    if (e.key === 'ArrowLeft')  onSeek(Math.max(currentTime - 5, 0));
  }, [currentTime, duration, onSeek]);

  return (
    <div id="sc-seekbar" data-testid="sc-seekbar" className={s.root}>
      <div
        ref={trackRef}
        className={s.track}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
        style={{ cursor: duration > 0 ? 'pointer' : 'default' }}
      >
        <div className={s.buffered} style={{ width: `${bufferedPct}%` }} />
        <div className={s.played}   style={{ width: `${playedPct}%` }} />
        <div className={s.thumb}    style={{ left: `${playedPct}%` }} />
      </div>

      {hoverX !== null && (
        <div id="sc-seekbar-tooltip" data-testid="sc-seekbar-tooltip" className={s.tooltip} style={{ left: hoverX }}>
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};

'use client';

import { type FC, useRef, useState, useEffect, useCallback } from 'react';
import { generateWaveformData, clamp } from '../../lib/playbackUtils';
import s from './WaveformDisplay.module.scss';

export interface WaveformDisplayProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  barCount?: number;
}

const CANVAS_HEIGHT = 60;
const PLAYED_COLOR   = '#FF5500';
const UNPLAYED_COLOR = '#333333';
const HOVER_COLOR    = '#FF7733';

export const WaveformDisplay: FC<WaveformDisplayProps> = ({
  currentTime,
  duration,
  onSeek,
  barCount = 100,
}) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars]       = useState(() => generateWaveformData(barCount));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [width, setWidth]       = useState(0);

  /* track container width */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* draw */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = width * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, CANVAS_HEIGHT);

    const barW     = width / barCount;
    const gap      = Math.max(1, barW * 0.2);
    const solidW   = barW - gap;
    const playedN  = duration > 0 ? Math.floor((currentTime / duration) * barCount) : 0;

    for (let i = 0; i < barCount; i++) {
      const h = bars[i] * (CANVAS_HEIGHT - 4);
      const x = i * barW + gap / 2;
      const y = (CANVAS_HEIGHT - h) / 2;

      ctx.fillStyle =
        i < playedN                          ? PLAYED_COLOR   :
        hoverIdx !== null && i <= hoverIdx   ? HOVER_COLOR    :
        UNPLAYED_COLOR;

      ctx.beginPath();
      ctx.roundRect(x, y, solidW, h, 1);
      ctx.fill();
    }
  }, [width, bars, currentTime, duration, hoverIdx, barCount]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const idx = Math.floor(clamp((e.clientX - rect.left) / rect.width, 0, 0.999) * barCount);
    setHoverIdx(idx);
  }, [barCount]);

  const handleMouseLeave = useCallback(() => setHoverIdx(null), []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || duration <= 0) return;
    const pct = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    onSeek(pct * duration);
  }, [duration, onSeek]);

  return (
    <div
      id="sc-waveform"
      data-testid="sc-waveform"
      ref={containerRef}
      className={s.root}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="slider"
      aria-label="Waveform seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      tabIndex={0}
    >
      <canvas ref={canvasRef} className={s.canvas} style={{ height: CANVAS_HEIGHT }} />
    </div>
  );
};

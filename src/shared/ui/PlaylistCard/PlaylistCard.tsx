'use client';

import { type FC, type MouseEventHandler } from 'react';
import s from './PlaylistCard.module.scss';

export interface PlaylistCardProps {
  title: string;
  coverUrl?: string;
  onPlay?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export const PlaylistCard: FC<PlaylistCardProps> = ({
  title, coverUrl, onPlay, onClick, className,
}) => (
  <div data-testid="playlist-card" className={[s.card, className].filter(Boolean).join(' ')} onClick={onClick}>
    <div className={s.cover}>
      {coverUrl ? (
        <img data-testid="playlist-card-artwork" className={s.coverImg} src={coverUrl} alt={title} />
      ) : (
        <div data-testid="playlist-card-artwork-placeholder" className={s.coverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
      )}
      <div data-testid="playlist-card-play-button" className={s.playOverlay} onClick={(e) => { e.stopPropagation(); onPlay?.(e); }}>
        <div className={s.playIcon}>
          <span className={s.playTriangle} />
        </div>
      </div>
    </div>
    <span data-testid="playlist-card-title" className={s.title}>{title}</span>
  </div>
);

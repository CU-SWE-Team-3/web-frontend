import { type FC } from 'react';
import s from './SidebarTrackItem.module.scss';

export interface SidebarTrackItemProps {
  title: string;
  artist: string;
  coverUrl?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const SidebarTrackItem: FC<SidebarTrackItemProps> = ({
  title, artist, coverUrl, plays, likes, reposts, comments, className,
}) => (
  <div data-testid="sidebar-track-item" className={[s.item, className].filter(Boolean).join(' ')}>
    <div className={s.cover}>
      {coverUrl ? (
        <img data-testid="sidebar-track-artwork" className={s.coverImg} src={coverUrl} alt={title} />
      ) : (
        <div data-testid="sidebar-track-artwork-placeholder" className={s.coverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
      )}
    </div>
    <div className={s.info}>
      <span data-testid="sidebar-track-artist" className={s.top}>{artist}</span>
      <span data-testid="sidebar-track-title" className={s.title}>{title}</span>
    </div>
    <div className={s.stats}>
      {plays !== undefined && <span data-testid="sidebar-track-plays">▶ {fmt(plays)}</span>}
      {likes !== undefined && <span data-testid="sidebar-track-likes">♥ {fmt(likes)}</span>}
      {reposts !== undefined && <span data-testid="sidebar-track-reposts">↻ {fmt(reposts)}</span>}
      {comments !== undefined && <span data-testid="sidebar-track-comments">💬 {fmt(comments)}</span>}
    </div>
  </div>
);

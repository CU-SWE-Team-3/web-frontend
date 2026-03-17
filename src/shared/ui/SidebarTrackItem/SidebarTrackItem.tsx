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
  <div className={[s.item, className].filter(Boolean).join(' ')}>
    <div className={s.cover}>
      {coverUrl ? (
        <img className={s.coverImg} src={coverUrl} alt={title} />
      ) : (
        <div className={s.coverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
      )}
    </div>
    <div className={s.info}>
      <span className={s.top}>{artist}</span>
      <span className={s.title}>{title}</span>
    </div>
    <div className={s.stats}>
      {plays !== undefined && <span>▶ {fmt(plays)}</span>}
      {likes !== undefined && <span>♥ {fmt(likes)}</span>}
      {reposts !== undefined && <span>↻ {fmt(reposts)}</span>}
      {comments !== undefined && <span>💬 {fmt(comments)}</span>}
    </div>
  </div>
);

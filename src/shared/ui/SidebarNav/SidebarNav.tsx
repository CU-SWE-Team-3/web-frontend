'use client';

import { type FC, type ReactNode } from 'react';
import s from './SidebarNav.module.scss';

export interface NavLink {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
}

export interface SidebarNavProps {
  links: NavLink[];
  recentTracks?: SidebarTrack[];
  likedTracks?: SidebarTrack[];
  onTrackClick?: (id: string) => void;
  className?: string;
}

export const SidebarNav: FC<SidebarNavProps> = ({
  links,
  recentTracks = [],
  likedTracks = [],
  onTrackClick,
  className,
}) => (
  <aside className={[s.sidebar, className].filter(Boolean).join(' ')}>
    {/* Top: Navigation Links */}
    <div className={s.section}>
      {links.map((link) => (
        <div
          key={link.key}
          className={`${s.navItem} ${link.active ? s.navItemActive : ''}`}
          onClick={link.onClick}
          role="link"
          tabIndex={0}
        >
          <span className={s.navIcon}>{link.icon}</span>
          {link.label}
        </div>
      ))}
    </div>

    {/* Middle: Recently Played */}
    {recentTracks.length > 0 && (
      <>
        <div className={s.divider} />
        <span className={s.sectionTitle}>Recently Played</span>
        <div className={s.trackList}>
          {recentTracks.map((track) => (
            <div
              key={track.id}
              className={s.trackItem}
              onClick={() => onTrackClick?.(track.id)}
            >
              <div className={s.trackCover}>
                {track.coverUrl ? (
                  <img className={s.trackCoverImg} src={track.coverUrl} alt={track.title} />
                ) : (
                  <div className={s.trackCoverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
                )}
              </div>
              <div className={s.trackMeta}>
                <span className={s.trackTitle}>{track.title}</span>
                <span className={s.trackArtist}>{track.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* Bottom: Liked Tracks */}
    {likedTracks.length > 0 && (
      <>
        <div className={s.divider} />
        <span className={s.sectionTitle}>Liked Tracks</span>
        <div className={s.trackList}>
          {likedTracks.map((track) => (
            <div
              key={track.id}
              className={s.trackItem}
              onClick={() => onTrackClick?.(track.id)}
            >
              <div className={s.trackCover}>
                {track.coverUrl ? (
                  <img className={s.trackCoverImg} src={track.coverUrl} alt={track.title} />
                ) : (
                  <div className={s.trackCoverImg} style={{ background: 'var(--sc-bg-dark-elevated)' }} />
                )}
              </div>
              <div className={s.trackMeta}>
                <span className={s.trackTitle}>{track.title}</span>
                <span className={s.trackArtist}>{track.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </aside>
);

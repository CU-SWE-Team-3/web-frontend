import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import s from './EngagementListLayout.module.scss';

interface EngagementListLayoutProps {
  children: ReactNode;
  trackId: string;
  trackInfo?: {
    title: string;
    artist: string;
    artworkUrl: string | null;
  };
}

export const EngagementListLayout = ({ children, trackId, trackInfo }: EngagementListLayoutProps) => {
  const pathname = usePathname();

  const tabs = [
    { label: 'Likes', path: `/track/${trackId}/likes` },
    { label: 'Reposts', path: `/track/${trackId}/reposts` },
    { label: 'In albums', path: `/track/${trackId}/albums` },
    { label: 'In playlists', path: `/track/${trackId}/playlists` },
    { label: 'Related tracks', path: `/track/${trackId}/related` },
  ];

  return (
    <div className={s.wrapper}>
      {/* Track Header Header */}
      {trackInfo && (
        <div className={s.trackHeader}>
          <div className={s.artwork}>
            <img src={trackInfo.artworkUrl || ''} alt={trackInfo.title} />
          </div>
          <div className={s.details}>
             <h1 className={s.title}>{trackInfo.title}</h1>
             <p className={s.artist}>{trackInfo.artist}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <nav className={s.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`${s.tab} ${pathname === tab.path ? s.active : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Grid Content */}
      <div className={s.content}>
        {children}
      </div>
    </div>
  );
};

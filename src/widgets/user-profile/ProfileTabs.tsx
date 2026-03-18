'use client';

import { type FC, useState } from 'react';
import { ShareIcon, EditIcon } from '@/shared/ui/icons';
import s from './ProfileTabs.module.scss';

const TABS = ['All', 'Popular tracks', 'Tracks', 'Albums', 'Playlists', 'Reposts'];

export interface ProfileTabsProps {
  onEditClick?: () => void;
  onShareClick?: () => void;
}

export const ProfileTabs: FC<ProfileTabsProps> = ({ onEditClick, onShareClick }) => {
  const [active, setActive] = useState('All');

  return (
    <div className={s.bar}>
      <nav className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${s.tab} ${active === t ? s.tabActive : ''}`}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className={s.actions}>
        <button className={s.actionBtn} onClick={onShareClick}>
          <ShareIcon size={14} /> Share
        </button>
        <button className={s.actionBtn} onClick={onEditClick}>
          <EditIcon size={14} /> Edit
        </button>
      </div>
    </div>
  );
};

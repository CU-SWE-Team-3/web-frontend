'use client';

import { type FC } from 'react';
import { AwardIcon } from '@/shared/ui/icons';
import { ProfileStats } from './ProfileStats';
import s from './ProfileSidebar.module.scss';

const FOOTER_LINKS = [
  'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
  'Imprint', 'Artist Resources', 'Newsroom', 'Charts',
  'Transparency Reports',
];

interface ProfileSidebarProps {
  followers: number;
  following: number;
  tracks: number;
  role?: string;
}

export const ProfileSidebar: FC<ProfileSidebarProps> = ({
  followers,
  following,
  tracks,
  role,
}) => (
  <aside className={s.sidebar}>
    {/* Stats */}
    <ProfileStats followers={followers} following={following} tracks={tracks} />

    <hr className={s.divider} />

    {/* ON TOUR - Only show upgrade if not an Artist */}
    {role !== 'Artist' && (
      <div className={s.tourBlock}>
        <div className={s.tourHead}>
          <AwardIcon size={16} className={s.tourIcon} />
          <span className={s.tourLabel}>ON TOUR</span>
          <span className={s.infoIcon}>ⓘ</span>
        </div>
        <p className={s.tourDesc}>
          With an Artist Pro account, you can create ticketed live events on
          BioBeats, and list existing events.
        </p>
        <button className={s.upgradeBtn}>Upgrade to Artist Pro</button>
      </div>
    )}

    {/* GO MOBILE */}
    <div className={s.mobileBlock}>
      <div className={s.mobileTitle}>GO MOBILE</div>
      <div className={s.badges}>
        <img
          src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
          alt="Download on the App Store"
          className={s.badge}
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          alt="Get it on Google Play"
          className={s.badge}
        />
      </div>
    </div>

    {/* Footer links */}
    <div className={s.footerBlock}>
      <div className={s.footerLinks}>
        {FOOTER_LINKS.map((link, i) => (
          <span key={link}>
            <span className={s.footerLink}>{link}</span>
            {i < FOOTER_LINKS.length - 1 && <span className={s.dot}> · </span>}
          </span>
        ))}
      </div>
    </div>

    <div className={s.langRow}>
      Language: <span className={s.langLink}>English (US)</span>
    </div>
  </aside>
);

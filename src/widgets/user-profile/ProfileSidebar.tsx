'use client';

import { type FC } from 'react';
import Link from 'next/link';
import { AwardIcon } from '@/shared/ui/icons';
import { ProfileStats } from './ProfileStats';
import { ROUTES } from '@/shared/constants/routes';
import s from './ProfileSidebar.module.scss';

const FOOTER_LINKS = [
  'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
  'Imprint', 'Artist Resources', 'Newsroom', 'Charts',
  'Transparency Reports',
];

// Detect platform from URL
function detectPlatform(url: string): { name: string; icon: JSX.Element } {
  const lower = url.toLowerCase();
  if (lower.includes('facebook.com') || lower.includes('fb.com'))
    return { name: 'Facebook', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> };
  if (lower.includes('instagram.com'))
    return { name: 'Instagram', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> };
  if (lower.includes('twitter.com') || lower.includes('x.com'))
    return { name: 'Twitter', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg> };
  if (lower.includes('youtube.com') || lower.includes('youtu.be'))
    return { name: 'YouTube', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> };
  if (lower.includes('tiktok.com'))
    return { name: 'TikTok', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> };
  return { name: 'Link', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> };
}

interface SocialLink {
  _id?: string;
  platform?: string;
  url: string;
  label?: string;
}

interface FollowingUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  followerCount: number;
  trackCount?: number;
}

interface ProfileSidebarProps {
  followers: number;
  following: number;
  tracks: number;
  role?: string;
  username?: string;
  bio?: string;
  socialLinks?: SocialLink[];
  followingUsers?: FollowingUser[];
}

export const ProfileSidebar: FC<ProfileSidebarProps> = ({
  followers,
  following,
  tracks,
  role,
  username,
  bio,
  socialLinks,
  followingUsers,
}) => (
  <aside className={s.sidebar}>
    {/* Stats */}
    <ProfileStats followers={followers} following={following} tracks={tracks} username={username} />

    {/* Bio */}
    {bio && (
      <>
        <hr className={s.divider} />
        <div className={s.bioBlock}>
          <p data-testid="profile-bio" className={s.bioText}>{bio}</p>
        </div>
      </>
    )}

    {/* Social Links */}
    {socialLinks && socialLinks.length > 0 && (
      <div data-testid="profile-social-links" className={s.socialLinksBlock}>
        {socialLinks.map((link, i) => {
          const { icon } = detectPlatform(link.url);
          const label = link.label || link.platform || link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
          return (
            <a
              key={link._id || i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={s.socialLink}
            >
              <span className={s.socialIcon}>{icon}</span>
              <span className={s.socialLabel}>{label}</span>
            </a>
          );
        })}
      </div>
    )}

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

    {/* Following Section — BELOW ON TOUR */}
    {followingUsers && followingUsers.length > 0 && (
      <>
        <hr className={s.divider} />
        <div className={s.followingBlock}>
          <div className={s.followingHeader}>
            <span className={s.followingTitle}>{followingUsers.length} FOLLOWING</span>
            <Link href={ROUTES.PROFILE(username || '') + '/following'} className={s.viewAllLink}>View all</Link>
          </div>
          <div data-testid="profile-following-list" className={s.followingList}>
            {followingUsers.slice(0, 3).map((user) => (
              <Link href={ROUTES.PROFILE(user.username || user.id)} key={user.id} className={s.followingItem}>
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'}
                  alt={user.displayName}
                  className={s.followingAvatar}
                />
                <div className={s.followingInfo}>
                  <span className={s.followingName}>{user.displayName}</span>
                  <span className={s.followingMeta}>
                    👤 {user.followerCount || 0} {user.trackCount != null && <>🎵 {user.trackCount}</>}
                  </span>
                </div>
                <span className={s.followingBadge}>Following</span>
              </Link>
            ))}
          </div>
        </div>
      </>
    )}

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

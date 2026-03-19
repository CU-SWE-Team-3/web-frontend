'use client';

import { type FC, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { CloseIcon } from '@/shared/ui/icons';
import { ProfileCover } from '@/widgets/user-profile/ProfileCover';
import { ProfileTabs } from '@/widgets/user-profile/ProfileTabs';
import { ProfileSidebar } from '@/widgets/user-profile/ProfileSidebar';
import { EditProfileModal } from '@/widgets/user-profile/EditProfileModal';
import { ShareModal } from '@/widgets/user-profile/ShareModal';
import { ChevronDownIcon, NotificationIcon, MessageIcon, MoreIcon } from '@/shared/ui/icons';
import s from './ProfilePage.module.scss';

/* apiUrl is read inline from process.env.NEXT_PUBLIC_API_URL */

interface ProfileData {
  displayName: string;
  permalink: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string;
  country: string;
  city: string;
  genres: string[];
  role: string;
  isPremium: boolean;
  followerCount: number;
  followingCount: number;
  socialLinks: { _id: string; platform: string; url: string }[];
  isPrivate: boolean;
  createdAt: string;
}

const defaultProfile: ProfileData = {
  displayName: '', permalink: '', avatarUrl: null, coverUrl: null,
  bio: '', country: '', city: '', genres: [], role: 'Listener',
  isPremium: false, followerCount: 0, followingCount: 0,
  socialLinks: [], isPrivate: false, createdAt: '',
};

const ProfilePage: FC<{ params: { username: string } }> = ({ params }) => {
  const { username } = params;
  const [bannerVisible, setBannerVisible] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({ ...defaultProfile, displayName: username, permalink: username });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/profile/${username}`, { withCredentials: true });
      if (response.data.success && response.data.data?.user) {
        setProfile(response.data.data.user);
      }
    } catch (err: any) {
      console.warn('Could not load profile:', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const displayName = profile.displayName || username;
  const location = [profile.city, profile.country].filter(Boolean).join(', ') || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div data-testid="profile-page" className={s.page}>
      <header data-testid="profile-nav" className={s.topNav}>
        <div className={s.navLeft}>
          <Link href={ROUTES.HOME} className={s.brandMark}>BIOBEATS</Link>
          <Link href={ROUTES.HOME} className={s.navLink}>Home</Link>
          <button className={s.navLink}>Feed</button>
          <button className={s.navLink}>Library</button>
        </div>
        <div className={s.navCenter}>
          <input data-testid="profile-search" className={s.searchBox} type="text" placeholder="Search" />
        </div>
        <div className={s.navRight}>
          <span className={s.tryProLink}>Try Artist Pro</span>
          <span className={s.navTextLink}>For Artists</span>
          <span className={s.navTextLink}>Upload</span>
          {profile.avatarUrl ? (
            <Link href={ROUTES.PROFILE(username)}>
              <img src={profile.avatarUrl} alt={displayName} className={s.avatarSmall} />
            </Link>
          ) : (
            <Link href={ROUTES.PROFILE(username)}>
              <div className={s.avatarSmall} />
            </Link>
          )}
          <button className={s.iconBtn}><ChevronDownIcon size={16} /></button>
          <button className={s.iconBtn}><NotificationIcon size={18} /></button>
          <button className={s.iconBtn}><MessageIcon size={18} /></button>
          <button className={s.iconBtn}><MoreIcon size={18} /></button>
        </div>
      </header>

      {bannerVisible && (
        <div className={s.banner}>
          <span className={s.bannerIcon}>⚡</span>
          <span className={s.bannerText}>
            <span className={s.bannerStrong}>Now available: </span>
            Get heard by up to 100 listeners on your next upload with Artist or Artist Pro.{' '}
            <span className={s.bannerLink}>Learn More</span>
          </span>
          <button className={s.bannerClose} onClick={() => setBannerVisible(false)}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      <ProfileCover
        displayName={displayName} subName={displayName} location={location}
        avatarUrl={profile.avatarUrl} coverUrl={profile.coverUrl}
        onImageUploaded={fetchProfile}
      />

      <ProfileTabs onEditClick={() => setEditOpen(true)} onShareClick={() => setShareOpen(true)} />

      <div className={s.content}>
        <div className={s.left}>
          <div className={s.empty}>
            <span className={s.emptyText}>Seems a little quiet over here</span>
            <button data-testid="profile-upload-btn" className={s.uploadBtn}>Upload now</button>
          </div>
        </div>
        <div className={s.right}>
          <ProfileSidebar followers={profile.followerCount} following={profile.followingCount} tracks={0} role={profile.role} username={username} />
        </div>
      </div>

      <EditProfileModal
        open={editOpen} onClose={() => setEditOpen(false)} onSaved={fetchProfile}
        profile={{ displayName, firstName, lastName, city: profile.city || '', country: profile.country || '',
          bio: profile.bio || '', profileUrl: profile.permalink || username,
          avatarUrl: profile.avatarUrl, genres: profile.genres || [],
          socialLinks: profile.socialLinks || [], isPrivate: !!profile.isPrivate }}
      />

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} profileUrl={profile.permalink || username} />
    </div>
  );
};

export default ProfilePage;

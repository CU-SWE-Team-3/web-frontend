'use client';

import { type FC, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  HomeIcon,
  SearchIcon,
  UploadIcon,
  NotificationIcon,
  MessageIcon,
  MoreIcon,
  ChevronDownIcon,
  CloseIcon,
  TrendingIcon,
} from '@/shared/ui/icons';
import { ProfileCover } from '@/widgets/user-profile/ProfileCover';
import { ProfileTabs } from '@/widgets/user-profile/ProfileTabs';
import { ProfileSidebar } from '@/widgets/user-profile/ProfileSidebar';
import { EditProfileModal } from '@/widgets/user-profile/EditProfileModal';
import { ShareModal } from '@/widgets/user-profile/ShareModal';
import s from './ProfilePage.module.scss';

const apiUrl = '/api/proxy';

interface ProfilePageProps {
  params: { username: string };
}

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
  displayName: '',
  permalink: '',
  avatarUrl: null,
  coverUrl: null,
  bio: '',
  country: '',
  city: '',
  genres: [],
  role: 'Listener',
  isPremium: false,
  followerCount: 0,
  followingCount: 0,
  socialLinks: [],
  isPrivate: false,
  createdAt: '',
};

const ProfilePage: FC<ProfilePageProps> = ({ params }) => {
  const { username } = params;
  const [bannerVisible, setBannerVisible] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    ...defaultProfile,
    displayName: username,
    permalink: username,
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/profile/${username}`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.data?.user) {
        setProfile(response.data.data.user);
      }
    } catch (err: any) {
      // Profile not found or API error — keep the default/fallback profile
      console.warn('Could not load profile:', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdated = () => {
    fetchProfile();
  };

  // Derived values
  const displayName = profile.displayName || username;
  const location =
    [profile.city, profile.country].filter(Boolean).join(', ') || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className={s.page}>
      {/* ===== 1. TOP NAV ===== */}
      <header className={s.topNav}>
        <div className={s.navLeft}>
          <span className={s.brandMark}>BIOBEATS</span>
          <button className={s.navLink}>Home</button>
          <button className={s.navLink}>Feed</button>
          <button className={s.navLink}>Library</button>
        </div>

        <div className={s.navCenter}>
          <input className={s.searchBox} type="text" placeholder="Search" />
        </div>

        <div className={s.navRight}>
          <span className={s.tryProLink}>Try Artist Pro</span>
          <span className={s.navTextLink}>For Artists</span>
          <span className={s.navTextLink}>Upload</span>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className={s.avatarSmall}
            />
          ) : (
            <div className={s.avatarSmall} />
          )}
          <button className={s.iconBtn}>
            <ChevronDownIcon size={16} />
          </button>
          <button className={s.iconBtn}>
            <NotificationIcon size={18} />
          </button>
          <button className={s.iconBtn}>
            <MessageIcon size={18} />
          </button>
          <button className={s.iconBtn}>
            <MoreIcon size={18} />
          </button>
        </div>
      </header>

      {/* ===== 2. BANNER ===== */}
      {bannerVisible && (
        <div className={s.banner}>
          <span className={s.bannerIcon}>⚡</span>
          <span className={s.bannerText}>
            <span className={s.bannerStrong}>Now available: </span>
            Get heard by up to 100 listeners on your next upload with Artist or
            Artist Pro.{' '}
            <span className={s.bannerLink}>Learn More</span>
          </span>
          <button
            className={s.bannerClose}
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* ===== 3. COVER ===== */}
      <ProfileCover
        displayName={displayName}
        subName={displayName}
        location={location}
        avatarUrl={profile.avatarUrl}
        coverUrl={profile.coverUrl}
        onImageUploaded={handleProfileUpdated}
      />

      {/* ===== 4. TABS ===== */}
      <ProfileTabs
        onEditClick={() => setEditOpen(true)}
        onShareClick={() => setShareOpen(true)}
      />

      {/* ===== 5. CONTENT ===== */}
      <div className={s.content}>
        <div className={s.left}>
          <div className={s.empty}>
            <span className={s.emptyText}>
              Seems a little quiet over here
            </span>
            <button className={s.uploadBtn}>Upload now</button>
          </div>
        </div>

        <div className={s.right}>
          <ProfileSidebar
            followers={profile.followerCount}
            following={profile.followingCount}
            tracks={0}
            role={profile.role}
          />
        </div>
      </div>

      {/* ===== 6. EDIT MODAL ===== */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={handleProfileUpdated}
        profile={{
          displayName,
          firstName,
          lastName,
          city: profile.city || '',
          country: profile.country || '',
          bio: profile.bio || '',
          profileUrl: profile.permalink || username,
          avatarUrl: profile.avatarUrl,
          genres: profile.genres || [],
          socialLinks: profile.socialLinks || [],
          isPrivate: !!profile.isPrivate,
        }}
      />

      {/* ===== 7. SHARE MODAL ===== */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        profileUrl={profile.permalink || username}
      />
    </div>
  );
};

export default ProfilePage;

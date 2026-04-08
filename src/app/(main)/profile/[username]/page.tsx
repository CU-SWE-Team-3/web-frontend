'use client';

import { type FC, useState, useEffect, useCallback } from 'react';
import { ProfileTrackCard } from '@/shared/ui/ProfileTrackCard/ProfileTrackCard';
import apiClient from '@/shared/api/client';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { CloseIcon } from '@/shared/ui/icons';
import { NavBar } from '@/shared/ui';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useFollowers, useFollowing } from '@/features/social-graph';
import { useUserTracks } from '@/features/tracks/model/trackQueries';
import { useUserReposts } from '@/features/track-engagement/model/useUserReposts';
import { ProfileCover } from '@/widgets/user-profile/ProfileCover';
import { ProfileTabs } from '@/widgets/user-profile/ProfileTabs';
import { ProfileSidebar } from '@/widgets/user-profile/ProfileSidebar';
import type { LikedTrackItem } from '@/widgets/user-profile/ProfileSidebar';
import { EditProfileModal } from '@/widgets/user-profile/EditProfileModal';
import { ShareModal } from '@/widgets/user-profile/ShareModal';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import s from './ProfilePage.module.scss';

/* apiUrl is read inline from process.env.NEXT_PUBLIC_API_URL */

interface ProfileData {
  _id?: string;
  id?: string;
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
  trackCount?: number;
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
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({ ...defaultProfile, displayName: username, permalink: username });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const isMeKeyword = username === 'me';
  const isOwnProfile = isMeKeyword || (authUser && (
    authUser.id === username || 
    authUser.permalink === username || 
    authUser.username === username ||
    (authUser as any)._id === username
  ));

  // Fetch true counts to fallback to if backend profile omits them
  // We use profile._id or profile.id if available, falling back to username.
  // This ensures the backend gets a valid ObjectId if it doesn't support permalink strings for these endpoints.
  const targetId = isOwnProfile 
    ? ((authUser as any)?._id || authUser?.id || username)
    : (profile._id || profile.id || username);

  const { data: followersList } = useFollowers(targetId !== 'me' ? targetId : '');
  const { data: followingList } = useFollowing(targetId !== 'me' ? targetId : '');
  const { data: userTracks = [], isLoading: isLoadingTracks } = useUserTracks(targetId);
  const { data: userReposts = [], isLoading: isLoadingReposts } = useUserReposts(targetId !== 'me' ? targetId : '');
  const { data: likedTracksRaw } = useLikedTracks();

  // Map liked tracks to the sidebar format
  const likedTracks: LikedTrackItem[] = (likedTracksRaw || []).map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    artworkUrl: t.artworkUrl,
  }));
  const likedTrackIds = new Set((likedTracksRaw || []).map(t => t.id || (t as any)._id));

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // First try fetching by the URL segment (could be permalink or ID)
      let profileData: any = null;
      try {
        const response = await apiClient.get(`/profile/${username}`, { withCredentials: true });
        console.log('[ProfilePage] API response:', JSON.stringify(response.data, null, 2));
        if (response.data.success) {
          profileData = response.data.data?.user || response.data.data;
        }
      } catch (apiErr: any) {
        console.warn('[ProfilePage] First fetch failed:', apiErr.response?.status, apiErr.response?.data?.error);
        
        // If 404 and this is the logged-in user's profile (navigated by ID), 
        // try fetching by their permalink instead
        const authState = useAuthStore.getState();
        const currentUser = authState.user;
        if (apiErr.response?.status === 404 && currentUser?.permalink) {
          try {
            const retryRes = await apiClient.get(`/profile/${currentUser.permalink}`, { withCredentials: true });
            console.log('[ProfilePage] Retry by permalink response:', JSON.stringify(retryRes.data, null, 2));
            if (retryRes.data.success) {
              profileData = retryRes.data.data?.user || retryRes.data.data;
            }
          } catch (retryErr: any) {
            console.warn('[ProfilePage] Retry by permalink also failed:', retryErr.response?.status);
          }
        }
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback: populate from auth store if API failed and this is own profile
        const authState = useAuthStore.getState();
        const currentUser = authState.user;
        const isOwn = currentUser && (
          currentUser.id === username || 
          currentUser.permalink === username || 
          currentUser.username === username ||
          (currentUser as any)._id === username
        );
        if (isOwn && currentUser) {
          console.log('[ProfilePage] Using auth store as fallback for own profile');
          setProfile(prev => ({
            ...prev,
            displayName: currentUser.displayName || username,
            avatarUrl: currentUser.avatarUrl || null,
            coverUrl: currentUser.coverUrl || null,
            permalink: currentUser.permalink || username,
            bio: (currentUser as any).bio || prev.bio || '',
            city: (currentUser as any).city || prev.city || '',
            country: (currentUser as any).country || prev.country || '',
            genres: (currentUser as any).genres || prev.genres || [],
          }));
        }
      }
    } catch (err: any) {
      console.warn('Could not load profile:', err.message);
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

  // For the avatar, prefer profile data, then fall back to auth store
  const effectiveAvatarUrl = profile.avatarUrl || (isOwnProfile ? authUser?.avatarUrl : null) || null;
  const effectiveCoverUrl = profile.coverUrl || (isOwnProfile ? authUser?.coverUrl : null) || null;

  // Helper: render a repost card
  const renderRepostCard = (repost: any) => {
    const track = repost.track || repost;
    return (
      <ProfileTrackCard
        key={`repost-${repost.id || track.id || track._id}`}
        track={{
          id: track._id || track.id,
          title: track.title,
          artist: track.artist?.displayName || track.artist || 'Unknown Artist',
          genre: track.genre || 'Electronic',
          tags: track.tags || [],
          releaseDate: track.releaseDate || '',
          visibility: track.visibility || 'Public',
          status: track.status || 'Finished',
          audioFileName: track.audioFileName || '',
          artworkUrl: track.artworkUrl || '',
          waveform: track.waveform || [],
          duration: track.duration || '0:00',
          createdAt: track.createdAt || repost.repostedAt || '',
        }}
        userFullName={track.artist?.displayName || track.artist || displayName}
        username={track.artist?.permalink || username}
        userAvatarUrl={track.artist?.avatarUrl || effectiveAvatarUrl || undefined}
        isOwner={false}
        isReposted={true}
        isLiked={likedTrackIds.has(track._id || track.id)}
        likeCount={track.likeCount || 0}
        repostCount={track.repostCount || 0}
        repostedBy={displayName}
      />
    );
  };

  // Helper: render a user's own track card
  const renderOwnTrackCard = (track: any) => (
    <ProfileTrackCard
      key={`track-${track.id}`}
      track={track}
      userFullName={displayName}
      username={username}
      userAvatarUrl={effectiveAvatarUrl || undefined}
      isOwner={!!isOwnProfile}
      isLiked={likedTrackIds.has(track.id || track._id)}
      likeCount={track.likeCount || 0}
      repostCount={track.repostCount || 0}
    />
  );

  // Render the content area based on active tab
  const renderTabContent = () => {
    /* ── Reposts tab: only reposts ── */
    if (activeTab === 'Reposts') {
      if (isLoadingReposts) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading reposts...</div>;
      }
      if (userReposts.length === 0) {
        return (
          <div className={s.empty} data-testid="reposts-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ opacity: 0.5 }}>
              <path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/>
            </svg>
            <span className={s.emptyText}>You haven&apos;t reposted any sounds.</span>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {userReposts.map(renderRepostCard)}
        </div>
      );
    }

    /* ── Tracks tab: only user's own tracks (NO reposts) ── */
    if (activeTab === 'Tracks') {
      if (isLoadingTracks) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading tracks...</div>;
      }
      if (userTracks.length === 0) {
        return (
          <div className={s.empty}>
            <span className={s.emptyText}>Seems a little quiet over here</span>
            {isOwnProfile && (
              <button data-testid="profile-upload-more-button" className={s.uploadBtn} onClick={() => router.push(ROUTES.UPLOAD)}>Upload now</button>
            )}
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {userTracks.map(renderOwnTrackCard)}
        </div>
      );
    }

    /* ── Popular tracks / Albums / Playlists: NO reposts ── */
    if (activeTab === 'Popular tracks' || activeTab === 'Albums' || activeTab === 'Playlists') {
      if (activeTab === 'Popular tracks') {
        if (isLoadingTracks) {
          return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading tracks...</div>;
        }
        // Sort by plays/likes descending – show own tracks only
        const sorted = [...userTracks].sort((a, b) =>
          ((b as any).plays || (b as any).playCount || 0) - ((a as any).plays || (a as any).playCount || 0)
        );
        if (sorted.length === 0) {
          return <div className={s.empty}><span className={s.emptyText}>No popular tracks yet</span></div>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sorted.map(renderOwnTrackCard)}
          </div>
        );
      }
      // Albums / Playlists: empty states for now
      return (
        <div className={s.empty}>
          <span className={s.emptyText}>
            {activeTab === 'Albums' ? 'No albums yet' : 'No playlists yet'}
          </span>
        </div>
      );
    }

    /* ── All tab (default): own tracks + reposts merged by date ── */
    if (isLoadingTracks && isLoadingReposts) {
      return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
    }

    // Build a merged list of own tracks + reposts, sorted by createdAt descending
    type MergedItem = { type: 'track'; data: any; date: string } | { type: 'repost'; data: any; date: string };
    const merged: MergedItem[] = [];

    for (const track of userTracks) {
      merged.push({ type: 'track', data: track, date: track.createdAt || '' });
    }
    for (const repost of userReposts) {
      const t = repost.track || repost;
      merged.push({ type: 'repost', data: repost, date: (repost as any).repostedAt || t.createdAt || '' });
    }

    // Sort newest first
    merged.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    if (merged.length === 0) {
      return (
        <div className={s.empty}>
          <span className={s.emptyText}>Seems a little quiet over here</span>
          {isOwnProfile && (
            <button data-testid="profile-upload-more-button" className={s.uploadBtn} onClick={() => router.push(ROUTES.UPLOAD)}>Upload now</button>
          )}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {merged.map((item) =>
          item.type === 'repost' ? renderRepostCard(item.data) : renderOwnTrackCard(item.data)
        )}

        {/* Upload More — only on own profile */}
        {isOwnProfile && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 20px', gap: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: 8,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#555" style={{ opacity: 0.5 }}>
              <path d="M3 18v-3c0-.55.45-1 1-1h2v4H4c-.55 0-1-.45-1-1zm4-1h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zm4-3c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-2v-4z"/>
            </svg>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>More uploads means more listeners.</p>
            <button
              data-testid="profile-upload-more-button"
              onClick={() => router.push(ROUTES.UPLOAD)}
              style={{
                padding: '8px 24px', borderRadius: 100,
                border: '1px solid #ccc',
                background: '#fff', color: '#333',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Upload more
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div data-testid="profile-page" className={s.page}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <ProfileCover
        displayName={displayName} subName={displayName} location={location}
        avatarUrl={effectiveAvatarUrl} coverUrl={effectiveCoverUrl}
        onImageUploaded={fetchProfile}
        isOwnProfile={!!isOwnProfile}
      />

      <ProfileTabs
        onEditClick={() => setEditOpen(true)}
        onShareClick={() => setShareOpen(true)}
        isOwnProfile={!!isOwnProfile}
        targetUserId={isOwnProfile ? undefined : profile?._id || profile?.id || username}
        profile={profile}
        onTabChange={setActiveTab}
      />

      <div className={s.content}>
        <div className={s.left}>
          {renderTabContent()}
        </div>
        <div className={s.right}>
          <ProfileSidebar 
            followers={followersList ? followersList.length : (profile.followerCount || 0)} 
            following={followingList ? followingList.length : (profile.followingCount || 0)} 
            tracks={userTracks ? userTracks.length : (profile.trackCount || 0)} 
            role={profile.role} 
            username={username}
            bio={profile.bio}
            socialLinks={profile.socialLinks}
            followingUsers={followingList || []}
            likedTracks={isOwnProfile ? likedTracks : []}
          />
        </div>
      </div>

      <EditProfileModal
        open={editOpen} onClose={() => setEditOpen(false)} onSaved={fetchProfile}
        profile={{ displayName, firstName, lastName, city: profile.city || '', country: profile.country || '',
          bio: profile.bio || '', profileUrl: profile.permalink || username,
          avatarUrl: effectiveAvatarUrl, genres: profile.genres || [],
          socialLinks: profile.socialLinks || [], isPrivate: !!profile.isPrivate }}
      />

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} profileUrl={profile.permalink || username} />
    </div>
  );
};

export default ProfilePage;

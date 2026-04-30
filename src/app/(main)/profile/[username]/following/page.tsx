'use client';

import { useFollowing } from '@/features/social-graph';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { FollowListGrid } from '@/features/social-graph/ui/FollowListGrid';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';
import apiClient from '@/shared/api/client';
import { useQuery } from '@tanstack/react-query';

export default function FollowingPage({ params }: { params: { username: string } }) {
  const { user } = useAuthStore();
  const isMeKeyword = params.username === 'me';
  const isOwnProfile = isMeKeyword || (user && (user.id === params.username || user.permalink === params.username || (user as any)._id === params.username));
  const resolvedId = isOwnProfile ? ((user as any)?._id || user?.id || params.username) : params.username;
  const profileQuery = useQuery({
    queryKey: ['profile-summary', params.username],
    enabled: Boolean(params.username) && !isOwnProfile,
    queryFn: async () => {
      const { data } = await apiClient.get(`/profile/${params.username}`, { withCredentials: true });
      return data?.data?.user || data?.data || data?.user || null;
    },
  });
  
  const { data: following, isLoading } = useFollowing(resolvedId !== 'me' ? resolvedId : '');
  const profileUser = profileQuery.data;
  const displayName = isOwnProfile
    ? (user?.displayName || user?.username || user?.permalink || params.username)
    : (profileUser?.displayName || profileUser?.username || profileUser?.permalink || params.username);
  const avatarUrl = isOwnProfile ? user?.avatarUrl : profileUser?.avatarUrl;

  return (
    <SocialPageLayout
      username={params.username}
      displayName={displayName}
      avatarUrl={avatarUrl}
      activeTab="following"
    >
      {isLoading ? (
        <FollowListGrid users={[]} isLoading />
      ) : !following || following.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '60px 0' }}>
          {displayName} isn&apos;t following anyone.
        </div>
      ) : (
        <FollowListGrid users={following} />
      )}
    </SocialPageLayout>
  );
}

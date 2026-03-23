'use client';

import { useFollowers } from '@/features/social-graph';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { FollowListGrid } from '@/features/social-graph/ui/FollowListGrid';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';

export default function FollowersPage({ params }: { params: { username: string } }) {
  const { user } = useAuthStore();
  const isMeKeyword = params.username === 'me';
  const isOwnProfile = isMeKeyword || (user && (user.id === params.username || user.permalink === params.username || (user as any)._id === params.username));
  const resolvedId = isOwnProfile ? ((user as any)?._id || user?.id || params.username) : params.username;
  
  const { data: followers, isLoading } = useFollowers(resolvedId !== 'me' ? resolvedId : '');

  return (
    <SocialPageLayout
      username={params.username}
      displayName={params.username}
      activeTab="followers"
    >
      {isLoading ? (
        <FollowListGrid users={[]} isLoading />
      ) : !followers || followers.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '60px 0' }}>
          No one is following {params.username} yet
        </div>
      ) : (
        <FollowListGrid users={followers} />
      )}
    </SocialPageLayout>
  );
}

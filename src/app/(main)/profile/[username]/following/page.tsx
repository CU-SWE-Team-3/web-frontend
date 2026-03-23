'use client';

import { useFollowing } from '@/features/social-graph';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { FollowListGrid } from '@/features/social-graph/ui/FollowListGrid';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';

export default function FollowingPage({ params }: { params: { username: string } }) {
  const { user } = useAuthStore();
  const isMeKeyword = params.username === 'me';
  const isOwnProfile = isMeKeyword || (user && (user.id === params.username || user.permalink === params.username || (user as any)._id === params.username));
  const resolvedId = isOwnProfile ? ((user as any)?._id || user?.id || params.username) : params.username;
  
  const { data: following, isLoading } = useFollowing(resolvedId !== 'me' ? resolvedId : '');

  return (
    <SocialPageLayout
      username={params.username}
      displayName={params.username}
      activeTab="following"
    >
      <div data-testid="following-page">
        {isLoading ? (
          <FollowListGrid users={[]} isLoading />
        ) : !following || following.length === 0 ? (
          <div data-testid="following-empty" style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '60px 0' }}>
            {params.username} isn&apos;t following anyone.
          </div>
        ) : (
          <FollowListGrid users={following} />
        )}
      </div>
    </SocialPageLayout>
  );
}

'use client';

import { useFollowing } from '@/features/social-graph';
import { FollowListGrid } from '@/features/social-graph/ui/FollowListGrid';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';

export default function FollowingPage({ params }: { params: { username: string } }) {
  const { data: following, isLoading } = useFollowing(params.username);

  return (
    <SocialPageLayout
      username={params.username}
      displayName={params.username}
      activeTab="following"
    >
      {isLoading ? (
        <FollowListGrid users={[]} isLoading />
      ) : !following || following.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '60px 0' }}>
          {params.username} isn&apos;t following anyone.
        </div>
      ) : (
        <FollowListGrid users={following} />
      )}
    </SocialPageLayout>
  );
}

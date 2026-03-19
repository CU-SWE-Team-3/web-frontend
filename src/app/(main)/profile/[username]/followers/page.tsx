'use client';

import { useFollowers } from '@/features/social-graph';
import { FollowListGrid } from '@/features/social-graph/ui/FollowListGrid';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';

export default function FollowersPage({ params }: { params: { username: string } }) {
  const { data: followers, isLoading } = useFollowers(params.username);

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

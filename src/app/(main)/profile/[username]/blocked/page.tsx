'use client';

import { BlockedUsersList } from '@/features/social-graph';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';

export default function BlockedUsersPage({ params }: { params: { username: string } }) {
  return (
    <SocialPageLayout
      username={params.username}
      displayName={params.username}
      activeTab="followers"
    >
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Blocked users</h2>
      <BlockedUsersList />
    </SocialPageLayout>
  );
}

'use client';

import { LikedTracksList } from '@/features/track-engagement/ui/LikedTracksList';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';

export default function LikesPage({ params }: { params: { username: string } }) {
  return (
    <SocialPageLayout
      username={params.username}
      displayName={params.username}
      activeTab="likes"
    >
      <LikedTracksList />
    </SocialPageLayout>
  );
}

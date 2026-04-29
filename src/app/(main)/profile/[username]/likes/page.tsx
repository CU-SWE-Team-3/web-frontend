'use client';

import { LikedTracksList } from '@/features/track-engagement/ui/LikedTracksList';
import { SocialPageLayout } from '@/widgets/user-profile/SocialPageLayout';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import apiClient from '@/shared/api/client';
import { useQuery } from '@tanstack/react-query';

export default function LikesPage({ params }: { params: { username: string } }) {
  const { user } = useAuthStore();
  const isOwnProfile = params.username === 'me' || !!(user && (
    user.id === params.username ||
    user.permalink === params.username ||
    user.username === params.username ||
    (user as any)._id === params.username
  ));
  const profileQuery = useQuery({
    queryKey: ['profile-summary', params.username],
    enabled: Boolean(params.username) && !isOwnProfile,
    queryFn: async () => {
      const { data } = await apiClient.get(`/profile/${params.username}`, { withCredentials: true });
      return data?.data?.user || data?.data || data?.user || null;
    },
  });
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
      activeTab="likes"
    >
      <LikedTracksList userId={params.username} />
    </SocialPageLayout>
  );
}

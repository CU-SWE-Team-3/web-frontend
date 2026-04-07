'use client';

import { useParams } from 'next/navigation';
import { useTrackReposters } from '@/features/track-engagement/model/useTrackReposters';
import { EngagementListLayout } from '@/features/track-engagement/ui/EngagementListLayout';
import { UserGridItem } from '@/features/track-engagement/ui/UserGridItem';
import { EmptyState } from '@/shared/ui';
import { RepostIcon } from '@/shared/ui/icons';

export default function TrackRepostersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: reposters, isLoading } = useTrackReposters(id) as { data: any[], isLoading: boolean };

  const mockTrackInfo = {
    title: "سورة البقرة | اسلام صبحي",
    artist: "Quran| قرآن",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop",
  };

  return (
    <EngagementListLayout trackId={id} trackInfo={mockTrackInfo}>
      {isLoading ? (
        <div className="col-span-full py-12 text-center text-gray-500">Loading...</div>
      ) : !reposters || reposters.length === 0 ? (
        <div className="col-span-full">
          <EmptyState
            title="No reposts yet"
            description="When this track is reposted, the users will appear here."
            icon={<RepostIcon size={48} />}
          />
        </div>
      ) : (
        reposters.map((user: any) => (
          <UserGridItem key={user.id} user={user} />
        ))
      )}
    </EngagementListLayout>
  );
}

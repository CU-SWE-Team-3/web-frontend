'use client';

import { useParams } from 'next/navigation';
import { useTrackLikers } from '@/features/track-engagement/model/useTrackLikers';
import { EngagementListLayout } from '@/features/track-engagement/ui/EngagementListLayout';
import { UserGridItem } from '@/features/track-engagement/ui/UserGridItem';
import { EmptyState } from '@/shared/ui';
import { LikeIcon } from '@/shared/ui/icons';

export default function TrackLikersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: likers, isLoading } = useTrackLikers(id) as { data: any[], isLoading: boolean };

  // Hardcoded for mock, normally fetched via useTrackInfo
  const mockTrackInfo = {
    title: "سورة البقرة | اسلام صبحي",
    artist: "Quran| قرآن",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop",
  };

  return (
    <EngagementListLayout trackId={id} trackInfo={mockTrackInfo}>
      {isLoading ? (
        <div className="col-span-full py-12 text-center text-gray-500">
          Loading likers...
        </div>
      ) : !likers || likers.length === 0 ? (
        <div className="col-span-full">
          <EmptyState
            title="No likes yet"
            description="When this track is liked, the users will appear here."
            icon={<LikeIcon size={48} />}
          />
        </div>
      ) : (
        likers.map((user: any) => (
          <UserGridItem key={user.id} user={user} />
        ))
      )}
    </EngagementListLayout>
  );
}

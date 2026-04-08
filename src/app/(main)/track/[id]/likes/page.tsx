'use client';

import { useParams } from 'next/navigation';
import { useTrackLikers } from '@/features/track-engagement/model/useTrackLikers';
import { EngagementListLayout } from '@/features/track-engagement/ui/EngagementListLayout';
import { UserGridItem } from '@/features/track-engagement/ui/UserGridItem';
import { useTrack } from '@/features/tracks/model/trackQueries';
import { EmptyState } from '@/shared/ui';
import { LikeIcon } from '@/shared/ui/icons';

export default function TrackLikersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: likers, isLoading } = useTrackLikers(id) as { data: any[], isLoading: boolean };
  const { data: track } = useTrack(id);

  const trackInfo = track ? {
    title: track.title,
    artist: (track.artist as any)?.displayName || (track.artist as any)?.username || "Unknown Artist",
    artworkUrl: track.artworkUrl || (track as any).coverUrl || null,
  } : undefined;

  return (
    <EngagementListLayout trackId={id} trackInfo={trackInfo}>
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

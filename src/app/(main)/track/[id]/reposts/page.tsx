'use client';

import { useParams } from 'next/navigation';
import { useTrackReposters } from '@/features/track-engagement/model/useTrackReposters';
import { EngagementListLayout } from '@/features/track-engagement/ui/EngagementListLayout';
import { UserGridItem } from '@/features/track-engagement/ui/UserGridItem';
import { useTrack } from '@/features/tracks/model/trackQueries';
import { EmptyState } from '@/shared/ui';
import { RepostIcon } from '@/shared/ui/icons';

export default function TrackRepostersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: reposters, isLoading } = useTrackReposters(id) as { data: any[], isLoading: boolean };
  const { data: track } = useTrack(id);

  const trackInfo = track ? {
    title: track.title,
    artist: (track.artist as any)?.displayName || (track.artist as any)?.username || "Unknown Artist",
    artworkUrl: track.artworkUrl || (track as any).coverUrl || null,
  } : undefined;

  return (
    <EngagementListLayout trackId={id} trackInfo={trackInfo}>
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

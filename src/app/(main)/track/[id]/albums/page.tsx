'use client';

import { useParams } from 'next/navigation';
import { useTrackPlaylists } from '@/features/track-engagement/model/useTrackPlaylists';
import { EngagementListLayout } from '@/features/track-engagement/ui/EngagementListLayout';
import { PlaylistCard, EmptyState } from '@/shared/ui';
import { useTrack } from '@/features/tracks/model/trackQueries';

export default function TrackAlbumsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: playlists, isLoading } = useTrackPlaylists(id) as { data: any[], isLoading: boolean };
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
      ) : !playlists || playlists.length === 0 ? (
        <div className="col-span-full">
          <EmptyState
            title="No albums yet"
            description="When this track is included in an album, it will appear here."
          />
        </div>
      ) : (
        playlists.map((playlist: any) => (
          <PlaylistCard 
            key={playlist.id} 
            title={playlist.title} 
            coverUrl={playlist.coverUrl} 
          />
        ))
      )}
    </EngagementListLayout>
  );
}

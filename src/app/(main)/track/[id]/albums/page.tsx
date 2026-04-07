'use client';

import { useParams } from 'next/navigation';
import { useTrackPlaylists } from '@/features/track-engagement/model/useTrackPlaylists';
import { EngagementListLayout } from '@/features/track-engagement/ui/EngagementListLayout';
import { PlaylistCard, EmptyState } from '@/shared/ui';

export default function TrackAlbumsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: playlists, isLoading } = useTrackPlaylists(id) as { data: any[], isLoading: boolean };

  const mockTrackInfo = {
    title: "سورة البقرة | اسلام صبحي",
    artist: "Quran| قرآن",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop",
  };

  return (
    <EngagementListLayout trackId={id} trackInfo={mockTrackInfo}>
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

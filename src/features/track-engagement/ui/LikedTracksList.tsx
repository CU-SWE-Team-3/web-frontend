import { useLikedTracks } from "../model/useLikedTracks";
import { usePlayerStore } from "@/features/player/model/playerStore";
import { SquareTrackCard } from "@/shared/ui";
import { Heart } from "lucide-react";

interface LikedTracksListProps {
  userId?: string;
}

export const LikedTracksList = ({ userId }: LikedTracksListProps) => {
  const { data: tracks, isLoading } = useLikedTracks(userId);
  const play = usePlayerStore((s) => s.play);
  const queue = usePlayerStore((s) => s.queue);
  const setQueue = usePlayerStore((s) => s.setQueue);

  if (isLoading) {
    return (
      <div data-testid="liked-tracks-skeleton" className="flex flex-wrap gap-8 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[160px] h-48 animate-pulse">
            <div className="w-[160px] h-[160px] bg-[#222] rounded-sm mb-2" />
            <div className="w-full h-4 bg-[#222] rounded mb-1" />
            <div className="w-1/2 h-3 bg-[#222] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div data-testid="liked-tracks-empty" className="py-20 text-center text-[#999] text-[15px]">
        You haven't liked any tracks yet.
      </div>
    );
  }

  const handlePlay = (track: any) => {
    const playerTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      artworkUrl: track.artworkUrl || "",
      streamUrl: track.streamUrl || track.hlsUrl || "",
      hlsUrl: track.hlsUrl || track.streamUrl || "",
      duration: track.duration || 0,
    };

    if (!queue.some((t) => t.id === playerTrack.id)) {
      setQueue([...queue, playerTrack]);
    }
    play(playerTrack);
  };

  return (
    <div data-testid="liked-tracks-list" className="flex flex-col pt-4">
      <div className="text-[14px] text-[#999] mb-6 font-medium">
        Hear the tracks you've liked:
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-10">
        {tracks.map((track) => (
          <SquareTrackCard
            key={track.id}
            id={track.id}
            title={track.title}
            artist={track.artist}
            artworkUrl={track.artworkUrl}
            onPlay={() => handlePlay(track)}
            titlePrefixNode={
              <Heart size={14} className="fill-[#999] text-[#999]" />
            }
          />
        ))}
      </div>
    </div>
  );
};

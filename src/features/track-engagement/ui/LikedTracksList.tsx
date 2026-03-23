import React from "react";
import { useLikedTracks } from "../model/useLikedTracks";
import { TrackCard } from "./TrackCard";

export const LikedTracksList = () => {
  const { data: tracks, isLoading } = useLikedTracks();

  if (isLoading) {
    return (
      <div data-testid="liked-tracks-skeleton" className="flex flex-col gap-6 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full max-w-[850px] h-[160px] flex gap-4 animate-pulse">
            <div className="w-[160px] h-[160px] bg-[#222]" />
            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="flex gap-4">
                <div className="w-[40px] h-[40px] bg-[#222] rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="w-1/4 h-4 bg-[#222] rounded" />
                  <div className="w-1/2 h-5 bg-[#222] rounded" />
                </div>
              </div>
              <div className="w-full h-[60px] bg-[#222] mt-4" />
            </div>
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

  return (
    <div data-testid="liked-tracks-list" className="flex flex-col pt-4">
      <div className="text-[14px] text-[#999] mb-6">
        Hear the tracks you've liked
      </div>
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  );
};

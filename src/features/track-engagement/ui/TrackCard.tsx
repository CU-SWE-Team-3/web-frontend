import React, { useState } from "react";
import { 
  PlayIcon, LikeIcon, RepostIcon, ShareIcon, 
  LinkIcon, MoreIcon, CommentIcon 
} from "@/shared/ui/icons";
import { TrackNode } from "../model/types";
import { useLikeTrack } from "../model/useLikeTrack";
import { useUnlikeTrack } from "../model/useUnlikeTrack";

interface TrackCardProps {
  track: TrackNode;
}

const formatCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(2)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const TrackCard = ({ track }: TrackCardProps) => {
  // We manage optimistic UI state locally for immediate response
  const [isLiked, setIsLiked] = useState(track.isLiked);
  const [likeCount, setLikeCount] = useState(track.likeCount);

  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => c - 1);
      unlikeMutation.mutate(track.id);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
      likeMutation.mutate(track.id);
    }
  };

  // Generate random heights for the fake waveform, seeded simply by rendering index
  // We memoize it so it doesn't flicker on re-renders (like when pressing 'Like')
  const [waveformBars] = useState(() => 
    Array.from({ length: 150 }).map(() => Math.floor(Math.random() * 80) + 10) // 10% to 90%
  );

  return (
    <div data-testid={`track-card-${track.id}`} className="flex gap-4 p-2 relative group w-full mb-6 max-w-[850px]">
      {/* Artwork */}
      <div className="w-[160px] h-[160px] flex-shrink-0 bg-[#222]">
        {track.artworkUrl ? (
          <img 
            src={track.artworkUrl} 
            alt={track.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#333] to-[#111]" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 pl-2">
        {/* Top Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Big Play Button */}
            <button className="w-[40px] h-[40px] rounded-full bg-[#f50] hover:bg-[#ff5500] text-white flex items-center justify-center flex-shrink-0 shadow-lg transition-colors">
              <PlayIcon size={20} fill="currentColor" className="ml-1" />
            </button>
            <div className="flex flex-col">
              <span className="text-[#999] text-[13px]">{track.artist}</span>
              <span className="text-white text-[16px] font-medium leading-snug">
                {track.title}
              </span>
            </div>
          </div>
          <span className="text-[#999] text-[12px]">{track.createdAt}</span>
        </div>

        {/* Waveform Visualization Placeholder */}
        <div className="h-[60px] w-full mt-4 flex items-end gap-[1px] relative pt-2">
          {waveformBars.map((h, i) => (
            <div 
              key={i} 
              className="flex-1 bg-[#888] rounded-t-sm opacity-70" 
              style={{ height: `${h}%` }}
            />
          ))}
          {/* Duration Badge overlaying the bottom right of the waveform */}
          <div className="absolute bottom-0 right-0 bg-[#111]/80 px-1 py-[1px] text-[10px] text-white">
            {track.durationFormatted}
          </div>
        </div>

        {/* Action Buttons & Stats */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] rounded bg-[#111] border transition-colors ${
                isLiked 
                  ? "border-[#f50] text-[#f50]" 
                  : "border-[#333] text-[#ccc] hover:border-[#666]"
              }`}
            >
              <LikeIcon size={14} fill={isLiked ? "currentColor" : "none"} />
              {formatCount(likeCount)}
            </button>
            
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] text-[#ccc] bg-[#111] border border-[#333] rounded hover:border-[#666] transition-colors">
              <RepostIcon size={14} />
              {formatCount(track.repostCount)}
            </button>

            <button className="flex items-center justify-center w-[30px] h-[26px] text-[#ccc] bg-[#111] border border-[#333] rounded hover:border-[#666] transition-colors">
              <ShareIcon size={14} />
            </button>

            <button className="flex items-center justify-center w-[30px] h-[26px] text-[#ccc] bg-[#111] border border-[#333] rounded hover:border-[#666] transition-colors">
              <LinkIcon size={14} />
            </button>

            <button className="flex items-center justify-center w-[30px] h-[26px] text-[#ccc] bg-[#111] border border-[#333] rounded hover:border-[#666] transition-colors">
              <MoreIcon size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4 text-[#999] text-[12px]">
            <div className="flex items-center gap-1.5">
              <PlayIcon size={12} fill="currentColor" />
              {formatCount(track.playCount)}
            </div>
            <div className="flex items-center gap-1.5">
              <CommentIcon size={12} />
              {formatCount(track.commentCount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

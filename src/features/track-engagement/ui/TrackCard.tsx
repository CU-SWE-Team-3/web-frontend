import React, { useState } from "react";
import { 
  PlayIcon, RepostIcon, ShareIcon, 
  LinkIcon, MoreIcon, CommentIcon 
} from "@/shared/ui/icons";
import { LikeButton } from "@/shared/ui";
import Link from "next/link";
import { TrackNode } from "../model/types";
import { useLikeTrack } from "../model/useLikeTrack";
import { useUnlikeTrack } from "../model/useUnlikeTrack";
import { useRepostTrack } from "../model/useRepostTrack";
import { useUnrepostTrack } from "../model/useUnrepostTrack";
import { LikeIcon } from "@/shared/ui/icons";
import WaveformPlayer from "@/features/tracks/ui/WaveformPlayer";
import { Suspense } from "react";

interface TrackCardProps {
  track: TrackNode;
}

const formatCount = (count?: number) => {
  if (count == null || isNaN(count)) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(2)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};
import { usePlayerStore } from '@/features/player/model/playerStore';

export const TrackCard = ({ track }: TrackCardProps) => {
  const play = usePlayerStore((s) => s.play);
  const queue = usePlayerStore((s) => s.queue);
  const setQueue = usePlayerStore((s) => s.setQueue);

  // We manage optimistic UI state locally for immediate response
  const [isLiked, setIsLiked] = useState(track.isLiked);
  const [likeCount, setLikeCount] = useState(track.likeCount);
  const [isReposted, setIsReposted] = useState(track.isReposted);
  const [repostCount, setRepostCount] = useState(track.repostCount);

  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();
  const repostMutation = useRepostTrack();
  const unrepostMutation = useUnrepostTrack();

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

  const handlePlay = () => {
    const playerTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      artworkUrl: track.artworkUrl || '',
      streamUrl: track.streamUrl || track.hlsUrl || '',
      hlsUrl: track.hlsUrl || track.streamUrl || '',
      duration: track.duration || 0,
    };
    
    // Add to queue if not present, then play
    if (!queue.some(t => t.id === playerTrack.id)) {
      setQueue([...queue, playerTrack]);
    }
    play(playerTrack);
  };

  const toggleRepost = () => {
    if (isReposted) {
      setIsReposted(false);
      setRepostCount((c) => Math.max(0, c - 1));
      unrepostMutation.mutate(track.id);
    } else {
      setIsReposted(true);
      setRepostCount((c) => c + 1);
      repostMutation.mutate({ trackId: track.id });
    }
  };



  return (
    <div data-testid={`track-card-${track.id}`} className="flex gap-4 p-2 relative group w-full mb-6 max-w-[850px]">
      <Link href={`/tracks/${track.id}`} className="w-[160px] h-[160px] flex-shrink-0 bg-[#222] transition-opacity hover:opacity-80">
        {track.artworkUrl && track.artworkUrl !== 'undefined' && track.artworkUrl !== 'null' ? (
          <img 
            src={track.artworkUrl} 
            alt={track.title} 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#333] to-[#111]" />
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 pl-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Big Play Button */}
            <button 
              onClick={handlePlay}
              className="w-[40px] h-[40px] rounded-full bg-[#f50] hover:bg-[#ff5500] text-white flex items-center justify-center flex-shrink-0 shadow-lg transition-colors"
            >
              <PlayIcon size={20} fill="currentColor" className="ml-1" />
            </button>
            <div className="flex flex-col">
              <span className="text-[#999] text-[13px]">{track.artist}</span>
              <Link href={`/tracks/${track.id}`} className="text-white text-[16px] font-medium leading-snug hover:underline">
                {track.title}
              </Link>
            </div>
          </div>
          <span className="text-[#999] text-[12px]">{track.createdAt}</span>
        </div>

        <div className="h-[60px] w-full mt-4 relative">
          {(track.hlsUrl || track.streamUrl) ? (
            <Suspense fallback={<div className="h-[60px] w-full bg-[#111]" />}>
              <WaveformPlayer 
                audioUrl={track.hlsUrl || track.streamUrl} 
                hidePlayButton 
              />
            </Suspense>
          ) : (
            <div className="h-[60px] w-full bg-[#111] flex items-center justify-center text-[10px] text-[#555]">
              No audio available
            </div>
          )}
          <div className="absolute bottom-2 right-0 bg-[#000]/60 px-1 py-[1px] text-[10px] text-white z-10 rounded-sm">
            {track.durationFormatted}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <LikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              onToggle={toggleLike}
            />
            
            <button
              data-testid={`track-card-repost-${track.id}`}
              onClick={toggleRepost}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] rounded transition-colors"
              style={{
                background: isReposted ? 'rgba(255, 85, 0, 0.15)' : '#111',
                border: `1px solid ${isReposted ? '#ff5500' : '#333'}`,
                color: isReposted ? '#ff5500' : '#ccc',
              }}
              title={isReposted ? 'Unrepost' : 'Repost'}
            >
              <RepostIcon size={14} />
              {formatCount(repostCount)}
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
            <Link href={`/tracks/${track.id}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <LikeIcon size={12} fill="currentColor" />
              {formatCount(likeCount)}
            </Link>
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


'use client';

import React, { FC, lazy, Suspense, useState } from 'react';
import Link from 'next/link';
import type { Track } from '@/features/tracks/model/track';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';

const WaveformPlayer = lazy(() => import('@/features/tracks/ui/WaveformPlayer'));

export interface ProfileTrackCardProps {
  track: Track;
  userFullName: string;
  username: string;
  userAvatarUrl?: string;
  isOwner?: boolean;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const ProfileTrackCard: FC<ProfileTrackCardProps> = ({
  track,
  userFullName,
  username,
  userAvatarUrl,
  isOwner,
}) => {
  const play = usePlayerStore((s) => s.play);
  const [isLiked, setIsLiked] = useState(false);
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      unlikeMutation.mutate(track.id);
    } else {
      setIsLiked(true);
      likeMutation.mutate(track.id);
    }
  };

  const handlePlay = () => {
    play({
      id: track.id,
      title: track.title,
      artist: userFullName || username,
      artworkUrl: track.artworkUrl || '/placeholder.png',
      hlsUrl: track.streamUrl || track.hlsUrl,
    });
  };

  return (
    <div data-testid="track-card" className="mb-8 font-inter">
      {/* Track Header */}
      <div className="flex gap-4">
        {/* Cover Art */}
        <div className="w-[160px] h-[160px] shrink-0 bg-[#222] rounded overflow-hidden">
          {track.artworkUrl ? (
            <img data-testid="track-card-artwork" src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : null}
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <button data-testid="track-card-play-button" onClick={handlePlay} className="w-9 h-9 bg-[#f50] text-white rounded-full flex items-center justify-center shrink-0 hover:bg-[#d44000] focus:outline-none transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <div className="min-w-0">
                <Link href={`/${username}`} className="text-[#999] text-[12px] hover:text-[#ccc] block truncate">
                  {userFullName}
                </Link>
                <Link data-testid="track-card-title" href={`/tracks/${track.id}`} className="text-white text-[15px] hover:text-white block truncate leading-tight">
                  {track.title}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#999] text-[11px] hover:text-[#ccc] cursor-pointer">5 minutes ago</span>
              <span className="px-2 py-0.5 bg-[#151515] text-[#ccc] text-[11px] rounded-full border border-[#333] cursor-pointer hover:border-[#666]">
                #{track.genre || 'Electronic'}
              </span>
            </div>
          </div>

          {/* Comment Input */}
          <div data-testid="track-card-comment-bar" className="bg-[#1a1a1a] h-7 rounded flex items-center gap-2 border border-[#333] px-2 mb-2 w-full max-w-[500px]">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 shrink-0 overflow-hidden">
               {userAvatarUrl ? <img src={userAvatarUrl} className="w-full h-full object-cover"/> : null}
            </div>
            <input data-testid="track-card-comment-input" type="text" placeholder="Write a comment" className="flex-1 bg-transparent border-none text-[12px] text-white outline-none placeholder-[#999]" />
            <button data-testid="track-card-comment-submit" className="text-[#999] hover:text-white shrink-0">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>

          {/* Waveform */}
          <div data-testid="track-card-waveform" className="flex-1 min-h-[60px] relative mt-1">
             <Suspense fallback={<div className="h-full w-full bg-[#111]" />}>
               <WaveformPlayer audioUrl={track.streamUrl || track.hlsUrl} waveform={track.waveform} trackMeta={{ id: track.id, title: track.title, artist: userFullName || username, artworkUrl: track.artworkUrl, hlsUrl: track.streamUrl || track.hlsUrl }} />
             </Suspense>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button data-testid="track-card-like-button" onClick={handleLike} className={`px-2 py-1 bg-[#151515] border rounded text-[11px] flex items-center gap-1.5 transition-colors ${isLiked ? 'border-[#f50] text-[#f50]' : 'border-[#333] hover:border-[#555] text-[#ccc]'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button data-testid="track-card-repost-button" className="px-2 py-1 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[11px] text-[#ccc] flex items-center gap-1.5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/></svg>
            Repost
          </button>
          <button data-testid="track-card-share-button" className="px-2 py-1 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[11px] text-[#ccc] flex items-center gap-1.5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            Share
          </button>
          <button className="px-2 py-1 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[11px] text-[#ccc] flex items-center gap-1.5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            Copy Link
          </button>
          {isOwner ? (
            <Link href={`/tracks/${track.id}`} className="px-2 py-1 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[11px] text-[#ccc] flex items-center gap-1.5 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </Link>
          ) : (
            <button data-testid="track-card-more-button" className="px-2 py-1 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[11px] text-[#ccc] flex items-center justify-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-[#999]">
           <span className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
             {formatCount((track as any).plays || 0)}
           </span>
           <span className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             {formatCount((track as any).likes || 0)}
           </span>
           <span className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/></svg>
             {formatCount((track as any).reposts || 0)}
           </span>
           <span className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             {formatCount((track as any).comments || 0)}
           </span>
        </div>
      </div>
    </div>
  );
};

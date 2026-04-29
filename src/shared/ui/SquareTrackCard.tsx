import React, { ReactNode } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

export interface SquareTrackCardProps {
  id: string;
  title: string;
  artist: string;
  artistPermalink?: string;
  trackPermalink?: string;
  artworkUrl?: string | null;
  onPlay?: () => void;
  titlePrefixNode?: ReactNode;
}

export const SquareTrackCard = ({
  id,
  title,
  artist,
  artistPermalink,
  trackPermalink,
  artworkUrl,
  onPlay,
  titlePrefixNode,
}: SquareTrackCardProps) => {
  return (
    <div className="w-[160px] group flex flex-col">
      <div 
        className="w-[160px] h-[160px] bg-[#222] rounded-sm mb-2 overflow-hidden hover:opacity-80 transition-opacity relative cursor-pointer"
        onClick={onPlay}
      >
        {artworkUrl && artworkUrl !== 'undefined' && artworkUrl !== 'null' ? (
          <img
            src={artworkUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#333] to-[#111]" />
        )}
      </div>
      <div className="flex items-start gap-1 min-w-0">
        {titlePrefixNode && <div className="flex-shrink-0 mt-0.5">{titlePrefixNode}</div>}
        <div className="min-w-0 flex-1">
          <Link 
            href={ROUTES.TRACK(trackPermalink || id)} 
            className="text-white text-[13px] font-medium truncate block hover:underline" 
            title={title}
          >
            {title}
          </Link>
          <Link 
            href={ROUTES.PROFILE(artistPermalink || artist)} 
            className="text-[#999] text-[12px] truncate block hover:underline" 
            title={artist}
          >
            {artist}
          </Link>
        </div>
      </div>
    </div>
  );
};

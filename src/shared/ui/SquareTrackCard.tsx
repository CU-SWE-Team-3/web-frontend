import React, { ReactNode } from "react";

interface SquareTrackCardProps {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
  onPlay?: () => void;
  titlePrefixNode?: ReactNode;
}

export const SquareTrackCard = ({
  id,
  title,
  artist,
  artworkUrl,
  onPlay,
  titlePrefixNode,
}: SquareTrackCardProps) => {
  return (
    <div
      className="w-[160px] cursor-pointer group"
      onClick={onPlay}
    >
      <div className="w-[160px] h-[160px] bg-[#222] rounded-sm mb-2 overflow-hidden group-hover:opacity-80 transition-opacity relative">
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
      <div className="flex items-start gap-1">
        {titlePrefixNode && <div className="flex-shrink-0 mt-0.5">{titlePrefixNode}</div>}
        <div className="min-w-0">
          <p className="text-white text-[13px] font-medium truncate" title={title}>{title}</p>
          <p className="text-[#999] text-[12px] truncate" title={artist}>{artist}</p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import Link from 'next/link';

interface SquareTrackCardProps {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  onPlay: () => void;
  titlePrefixNode?: React.ReactNode;
}

export const SquareTrackCard = ({
  id,
  title,
  artist,
  artworkUrl,
  onPlay,
  titlePrefixNode
}: SquareTrackCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="flex flex-col gap-2 w-[160px] flex-shrink-0 group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-[160px] h-[160px] bg-[#333] shadow-md overflow-hidden rounded-sm">
        {artworkUrl ? (
          <img 
            src={artworkUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#333] to-[#111]" />
        )}
        
        {/* Play Overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay();
              }}
              className="w-12 h-12 rounded-full bg-[#f50] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          {titlePrefixNode}
          <Link 
            href={`/track/${id}`} 
            className="text-[14px] text-white font-medium truncate hover:text-[#f50] transition-colors"
            title={title}
          >
            {title}
          </Link>
        </div>
        <span 
          className="text-[12px] text-[#999] truncate"
          title={artist}
        >
          {artist}
        </span>
      </div>
    </div>
  );
};

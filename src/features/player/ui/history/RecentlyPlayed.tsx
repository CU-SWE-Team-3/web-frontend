'use client';

import { type FC } from 'react';
import { X } from 'lucide-react';
import type { Track } from '../../model/playerStore';
import s from './RecentlyPlayed.module.scss';

export interface RecentlyPlayedProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  onClear: () => void;
}

export const RecentlyPlayed: FC<RecentlyPlayedProps> = ({ tracks, onPlay, onClear }) => (
  <div id="sc-recently-played" data-testid="sc-recently-played" className={s.root}>
    <div className={s.header}>
      <h2 className={s.title}>Recently Played</h2>
      {tracks.length > 0 && (
        <button id="sc-btn-clear-recent" data-testid="sc-btn-clear-recent" onClick={onClear} className={s.clearBtn}>
          <X size={12} />
          Clear history
        </button>
      )}
    </div>

    {tracks.length === 0 ? (
      <p className={s.empty}>No recently played tracks</p>
    ) : (
      <div className={s.list}>
        {tracks.map((track, index) => (
          <button
            key={track.id}
            id={`sc-recent-item-${index}`}
            data-testid={`sc-recent-item-${index}`}
            onClick={() => onPlay(track)}
            className={s.item}
          >
            <div className={s.thumbWrap}>
              <img src={track.artworkUrl} alt={track.title} className={s.itemThumb} />
              <div className={s.itemOverlay}>
                <div className={s.playIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
            </div>
            <span className={s.itemTitle}>{track.title}</span>
            <span className={s.itemArtist}>{track.artist}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);

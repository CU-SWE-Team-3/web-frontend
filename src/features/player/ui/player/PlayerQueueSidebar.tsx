'use client';

import { type FC } from 'react';
import { X, Play, Equal, MoreHorizontal, Heart } from 'lucide-react';
import { usePlayerStore } from '../../model/playerStore';
import { formatTime } from '../../lib/playbackUtils';
import s from './PlayerQueueSidebar.module.scss';
import clsx from 'clsx';

export const PlayerQueueSidebar: FC = () => {
  const { currentTrack, queue, isQueueOpen, toggleQueueSidebar, play, clearQueue, removeFromQueue } = usePlayerStore();

  if (!isQueueOpen) return null;

  return (
    <div className={s.sidebar} data-testid="queue-sidebar">
      <div className={s.header}>
        <h3 className={s.title}>Next up</h3>
        <div className={s.headerActions}>
          <button onClick={clearQueue} className={s.clearBtn}>Clear</button>
          <button onClick={toggleQueueSidebar} className={s.closeBtn} aria-label="Close queue">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={s.trackList}>
        {/* Active Track Highlight */}
        {currentTrack && (
          <div className={clsx(s.trackItem, s.active)}>
            <div className={s.thumb}>
              <img src={currentTrack.artworkUrl} alt={currentTrack.title} />
              <div className={s.thumbOverlay}>
                <Equal size={16} fill="white" className="animate-pulse" />
              </div>
            </div>
            <div className={s.info}>
              <span className={s.trackArtist}>{currentTrack.artist}</span>
              <span className={s.trackTitle}>{currentTrack.title}</span>
            </div>
          </div>
        )}

        {/* Queued Tracks */}
        {queue.length === 0 && (
          <div className="p-4 text-sm text-neutral-400 text-center">Your queue is empty.</div>
        )}
        
        {queue.map((track, i) => (
          <div 
            key={`${track.id}-${i}`} 
            className={s.trackItem}
            onClick={() => play(track)}
          >
            <div className={s.thumb}>
              <img src={track.artworkUrl} alt={track.title} />
              <div className={s.thumbOverlay}>
                <Play size={16} fill="white" />
              </div>
            </div>
            <div className={s.info}>
              <span className={s.trackArtist}>{track.artist}</span>
              <span className={s.trackTitle}>{track.title}</span>
            </div>
            <div className={s.actions}>
              <button className={s.actionBtn}><Heart size={14} /></button>
              <button className={s.actionBtn}><MoreHorizontal size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className={s.footer}>
        <div className={s.autoplayToggle}>
          <div className={s.autoplayInfo}>
            <h4>Autoplay station</h4>
            <p>Hear related tracks based on what's playing now.</p>
          </div>
          <div className={s.toggleSwitch}>
            {/* Fake toggle for visual match with reference */}
            <input type="checkbox" id="autoplay-toggle" defaultChecked className={s.srOnly} />
            <label htmlFor="autoplay-toggle" className={s.toggleLabel}></label>
          </div>
        </div>
      </div>
    </div>
  );
};

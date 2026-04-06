'use client';

import { type FC, useState } from 'react';
import { X, Play, Pause, Equal, Heart, Share2, ListPlus, ListMusic, Download, Radio } from 'lucide-react';
import { usePlayerStore } from '../../model/playerStore';
import { formatTime } from '../../lib/playbackUtils';
import s from './PlayerQueueSidebar.module.scss';
import clsx from 'clsx';

export const PlayerQueueSidebar: FC = () => {
  const { currentTrack, queue, isQueueOpen, isPlaying, toggleQueueSidebar, play, pause, clearQueue, removeFromQueue, addToQueue } = usePlayerStore();
  const [autoplay, setAutoplay] = useState(true);
  const [contextMenuTrackId, setContextMenuTrackId] = useState<string | null>(null);

  if (!isQueueOpen) return null;

  const handleTrackPlay = (track: typeof queue[0]) => {
    if (currentTrack?.id === track.id) {
      // Toggle play/pause for current track
      isPlaying ? pause() : play();
      if (usePlayerStore.getState().playbackSource === 'inline') {
        window.dispatchEvent(new CustomEvent('playerbar-playpause'));
      }
    } else {
      play(track);
    }
  };

  const handleContextMenu = (trackId: string) => {
    setContextMenuTrackId(contextMenuTrackId === trackId ? null : trackId);
  };

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
            <div className={s.thumb} onClick={() => handleTrackPlay(currentTrack)}>
              <img src={currentTrack.artworkUrl} alt={currentTrack.title} />
              <div className={s.thumbOverlay}>
                {isPlaying ? (
                  <Equal size={16} fill="white" className="animate-pulse" />
                ) : (
                  <Play size={16} fill="white" />
                )}
              </div>
            </div>
            <div className={s.info}>
              <span className={s.trackArtist}>{currentTrack.artist}</span>
              <span className={s.trackTitle}>{currentTrack.title}</span>
            </div>
            <div className={s.trackDuration}>
              {currentTrack.duration ? formatTime(currentTrack.duration) : ''}
            </div>
            <div className={s.actions}>
              <button className={s.actionBtn} aria-label="Like">
                <Heart size={14} />
              </button>
              <button className={s.actionBtn} onClick={() => handleContextMenu(currentTrack.id)} aria-label="More options">
                <span style={{ fontSize: 18, lineHeight: 1 }}>···</span>
              </button>
            </div>

            {/* Context Menu */}
            {contextMenuTrackId === currentTrack.id && (
              <div className={s.contextMenu}>
                <button className={s.contextMenuItem}><Heart size={14} /> Like</button>
                <button className={s.contextMenuItem}><Share2 size={14} /> Share</button>
                <button className={s.contextMenuItem}><ListPlus size={14} /> Add to Next up</button>
                <button className={s.contextMenuItem}><ListMusic size={14} /> Add to Playlist</button>
                <button className={s.contextMenuItem}><Download size={14} /> Download file</button>
                <button className={s.contextMenuItem}><Radio size={14} /> Station</button>
              </div>
            )}
          </div>
        )}

        {/* Queued Tracks */}
        {queue.filter(t => t.id !== currentTrack?.id).length === 0 && (
          <div className="p-4 text-sm text-neutral-400 text-center">Your queue is empty.</div>
        )}
        
        {queue.filter(t => t.id !== currentTrack?.id).map((track, i) => (
          <div 
            key={`${track.id}-${i}`} 
            className={s.trackItem}
            style={{ position: 'relative' }}
          >
            <div className={s.thumb} onClick={() => handleTrackPlay(track)}>
              <img src={track.artworkUrl} alt={track.title} />
              <div className={s.thumbOverlay}>
                <Play size={16} fill="white" />
              </div>
            </div>
            <div className={s.info}>
              <span className={s.trackArtist}>{track.artist}</span>
              <span className={s.trackTitle}>{track.title}</span>
            </div>
            <div className={s.trackDuration}>
              {track.duration ? formatTime(track.duration) : ''}
            </div>
            <div className={s.actions}>
              <button className={s.actionBtn} aria-label="Like">
                <Heart size={14} />
              </button>
              <button className={s.actionBtn} onClick={() => handleContextMenu(track.id)} aria-label="More options">
                <span style={{ fontSize: 18, lineHeight: 1 }}>···</span>
              </button>
            </div>

            {/* Context Menu */}
            {contextMenuTrackId === track.id && (
              <div className={s.contextMenu}>
                <button className={s.contextMenuItem}><Heart size={14} /> Like</button>
                <button className={s.contextMenuItem}><Share2 size={14} /> Share</button>
                <button className={s.contextMenuItem} onClick={() => { addToQueue(track); setContextMenuTrackId(null); }}><ListPlus size={14} /> Add to Next up</button>
                <button className={s.contextMenuItem}><ListMusic size={14} /> Add to Playlist</button>
                <button className={s.contextMenuItem}><Download size={14} /> Download file</button>
                <button className={s.contextMenuItem}><Radio size={14} /> Station</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={s.footer}>
        <div className={s.autoplayToggle}>
          <div className={s.autoplayInfo}>
            <h4>Autoplay station</h4>
            <p>Hear related tracks based on what&apos;s playing now.</p>
          </div>
          <div className={s.toggleSwitch}>
            <input 
              type="checkbox" 
              id="autoplay-toggle" 
              checked={autoplay}
              onChange={() => setAutoplay(!autoplay)}
              className={s.srOnly} 
            />
            <label htmlFor="autoplay-toggle" className={clsx(s.toggleLabel, autoplay && s.toggleActive)}></label>
          </div>
        </div>
      </div>
    </div>
  );
};

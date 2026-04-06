'use client';

import { type FC, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play, Equal, Heart, Share2, ListPlus, ListMusic, Download, Radio } from 'lucide-react';
import { usePlayerStore } from '../../model/playerStore';
import { formatTime } from '../../lib/playbackUtils';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import s from './PlayerQueueSidebar.module.scss';
import clsx from 'clsx';

export const PlayerQueueSidebar: FC = () => {
  const router = useRouter();
  const { currentTrack, queue, isQueueOpen, isPlaying, toggleQueueSidebar, play, pause, clearQueue, addToQueue } = usePlayerStore();
  const [autoplay, setAutoplay] = useState(true);
  const [contextMenuTrackId, setContextMenuTrackId] = useState<string | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  if (!isQueueOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const closeMenu = () => setContextMenuTrackId(null);

  // ─── Context Menu Action Handlers ───

  const handleLike = (trackId: string) => {
    if (likedTrackIds.has(trackId)) {
      setLikedTrackIds(prev => { const next = new Set(prev); next.delete(trackId); return next; });
      unlikeMutation.mutate(trackId);
      showToast('Removed from Likes');
    } else {
      setLikedTrackIds(prev => new Set(prev).add(trackId));
      likeMutation.mutate(trackId);
      showToast('Added to Likes');
    }
    closeMenu();
  };

  const handleShare = (trackId: string) => {
    const url = `${window.location.origin}/tracks/${trackId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied to clipboard');
    }).catch(() => {
      showToast('Could not copy link');
    });
    closeMenu();
  };

  const handleAddToNextUp = (track: typeof queue[0]) => {
    addToQueue(track);
    showToast(`Added "${track.title}" to Next up`);
    closeMenu();
  };

  const handleAddToPlaylist = (trackId: string) => {
    // Playlist feature not yet built — show informational toast
    showToast('Playlist feature coming soon');
    closeMenu();
  };

  const handleDownload = (track: typeof queue[0]) => {
    if (track.hlsUrl) {
      const a = document.createElement('a');
      a.href = track.hlsUrl;
      a.download = `${track.artist} - ${track.title}.mp3`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Download started');
    } else {
      showToast('No audio file available');
    }
    closeMenu();
  };

  const handleStation = (track: typeof queue[0]) => {
    // Navigate to feed with the track context — mimics SoundCloud's "Station" 
    router.push(`/feed`);
    showToast(`Station for "${track.title}" — playing related tracks`);
    closeMenu();
  };

  // ─── Track Play Handler ───

  const handleTrackPlay = (track: typeof queue[0]) => {
    if (currentTrack?.id === track.id) {
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

  // ─── Reusable Context Menu ───

  const renderContextMenu = (track: typeof queue[0]) => (
    <div className={s.contextMenu}>
      <button className={s.contextMenuItem} onClick={() => handleLike(track.id)}>
        <Heart size={14} fill={likedTrackIds.has(track.id) ? '#f50' : 'none'} color={likedTrackIds.has(track.id) ? '#f50' : 'currentColor'} />
        {likedTrackIds.has(track.id) ? 'Unlike' : 'Like'}
      </button>
      <button className={s.contextMenuItem} onClick={() => handleShare(track.id)}>
        <Share2 size={14} /> Share
      </button>
      <button className={s.contextMenuItem} onClick={() => handleAddToNextUp(track)}>
        <ListPlus size={14} /> Add to Next up
      </button>
      <button className={s.contextMenuItem} onClick={() => handleAddToPlaylist(track.id)}>
        <ListMusic size={14} /> Add to Playlist
      </button>
      <button className={s.contextMenuItem} onClick={() => handleDownload(track)}>
        <Download size={14} /> Download file
      </button>
      <button className={s.contextMenuItem} onClick={() => handleStation(track)}>
        <Radio size={14} /> Station
      </button>
    </div>
  );

  return (
    <div className={s.sidebar} data-testid="queue-sidebar">
      {/* Toast notification */}
      {toast && (
        <div className={s.toast}>{toast}</div>
      )}

      {/* Invisible overlay to close context menu */}
      {contextMenuTrackId && (
        <div className="fixed inset-0 z-[90]" onClick={closeMenu} />
      )}
      
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
          <div className={clsx(s.trackItem, s.active)} style={{ position: 'relative' }}>
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
              <button
                className={clsx(s.actionBtn, likedTrackIds.has(currentTrack.id) && s.actionBtnActive)}
                onClick={() => handleLike(currentTrack.id)}
                aria-label="Like"
              >
                <Heart size={14} fill={likedTrackIds.has(currentTrack.id) ? 'currentColor' : 'none'} />
              </button>
              <button className={s.actionBtn} onClick={() => handleContextMenu(currentTrack.id)} aria-label="More options">
                <span style={{ fontSize: 18, lineHeight: 1 }}>···</span>
              </button>
            </div>

            {contextMenuTrackId === currentTrack.id && renderContextMenu(currentTrack)}
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
              <button
                className={clsx(s.actionBtn, likedTrackIds.has(track.id) && s.actionBtnActive)}
                onClick={() => handleLike(track.id)}
                aria-label="Like"
              >
                <Heart size={14} fill={likedTrackIds.has(track.id) ? 'currentColor' : 'none'} />
              </button>
              <button className={s.actionBtn} onClick={() => handleContextMenu(track.id)} aria-label="More options">
                <span style={{ fontSize: 18, lineHeight: 1 }}>···</span>
              </button>
            </div>

            {contextMenuTrackId === track.id && renderContextMenu(track)}
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

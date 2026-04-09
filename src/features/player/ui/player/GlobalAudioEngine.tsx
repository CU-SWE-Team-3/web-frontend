'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../model/playerStore';
import { PlayerBar } from '@/shared/ui/PlayerBar/PlayerBar';
import { PlayerQueueSidebar } from './PlayerQueueSidebar';
import { DEMO_TRACKS } from '../../model/mockTracks';

import { useHistoryStore } from '../../model/historyStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';

export const GlobalAudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isQueueOpen,
    playbackSource,
    queue,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    setCurrentTime,
    setDuration,
    setBuffered,
    setQueue,
    toggleShuffle,
    cycleRepeatMode,
    toggleQueueSidebar,
  } = usePlayerStore();

  const [hasStarted, setHasStarted] = useState(false);

  const { data: likedTracks } = useLikedTracks();
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();
  const isLiked = currentTrack ? likedTracks?.some(t => t.id === currentTrack.id) : false;

  const handleLike = () => {
    if (!currentTrack) return;
    if (isLiked) {
      unlikeMutation.mutate(currentTrack.id);
    } else {
      likeMutation.mutate(currentTrack.id);
    }
  };

  // Preload demo tracks into the queue on mount
  useEffect(() => {
    if (queue.length === 0) {
      setQueue(DEMO_TRACKS);
    }
  }, []);

  // Handle global repeat restarting
  useEffect(() => {
    const handleRestart = () => {
      if (playbackSource === 'global' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setCurrentTime(0);
      }
    };
    window.addEventListener('playerbar-restart', handleRestart);
    return () => window.removeEventListener('playerbar-restart', handleRestart);
  }, [playbackSource, setCurrentTime]);

  // 1. Sync Audio Element with Zustand State
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Only control the hidden <audio> when source is 'global'
    // When 'inline', WaveformPlayer handles the actual audio
    if (playbackSource === 'inline') {
      audioRef.current.pause();
      return;
    }

    if (isPlaying) {
      if (currentTrack?.restrictedRegions && currentTrack.restrictedRegions.length > 0) {
        alert("Not available in your region or tier");
        pause();
        return;
      }

      audioRef.current.play().catch(e => {
        console.warn("Autoplay prevented:", e);
        pause();
      });
      setHasStarted(true);

      // Add to local history store immediately
      if (currentTrack) {
        useHistoryStore.getState().addToHistory(currentTrack, 0);
        // Also ping the backend lightly
        import('../../api/historyApi').then(api => {
          api.historyApi.recordProgress(currentTrack.id, 0).catch(err => console.debug('Initial progress log ignored', err));
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, playbackSource]);

  // 2. Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      if (currentTrack?.tier === 'pro' && time >= 30) {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          alert("This is a premium track. Previewing 30 seconds.");
          pause();
        }
        audioRef.current.currentTime = 30;
        setCurrentTime(30);
      } else {
        setCurrentTime(time);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgress = () => {
    if (audioRef.current && audioRef.current.buffered.length > 0) {
      const bufferedEnd = audioRef.current.buffered.end(audioRef.current.buffered.length - 1);
      setBuffered(bufferedEnd / audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    const { repeatMode, queue, currentTrack } = usePlayerStore.getState();

    if (currentTrack) {
      const durationNum = duration || audioRef.current?.duration || 0;
      import('../../api/historyApi').then(api => {
        api.historyApi.recordProgress(currentTrack.id, Math.floor(durationNum)).catch(() => {});
      });
    }

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setCurrentTime(0);
      return;
    }

    if (repeatMode === 'none') {
      const idx = queue.findIndex(t => t.id === currentTrack?.id);
      if (idx >= queue.length - 1) {
        pause();
        setCurrentTime(0);
        return;
      }
    }

    nextTrack();
  };

  const handleSeek = (time: number) => {
    if (currentTrack?.tier === 'pro' && time > 30) {
      time = 30; // clamp
    }
    if (playbackSource === 'global' && audioRef.current) {
      audioRef.current.currentTime = time;
    }
    // Dispatch a custom event so the active WaveformPlayer can sync
    if (playbackSource === 'inline') {
      window.dispatchEvent(new CustomEvent('playerbar-seek', { detail: { time } }));
    }
    seek(time);
  };
  
  useEffect(() => {
    const onGlobalSeek = (e: any) => {
      if (e.detail?.time !== undefined && audioRef.current) {
        audioRef.current.currentTime = e.detail.time;
      }
    };
    window.addEventListener('playerbar-seek', onGlobalSeek);
    return () => window.removeEventListener('playerbar-seek', onGlobalSeek);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play(undefined, playbackSource); 
    }
    // When source is inline, tell the WaveformPlayer to play/pause
    if (playbackSource === 'inline') {
      window.dispatchEvent(new CustomEvent('playerbar-playpause'));
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.streamUrl || currentTrack?.hlsUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onEnded={handleEnded}
        className="hidden"
      />
      
      {/* The Player Bar is only visible if there is an active track or history */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <PlayerBar
            track={{
              id: currentTrack.id,
              title: currentTrack.title,
              artist: currentTrack.artist,
              artworkUrl: currentTrack.artworkUrl,
            }}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration || audioRef.current?.duration || 0}
            buffered={audioRef.current?.buffered.length ? audioRef.current.buffered.end(0) / (audioRef.current.duration || 1) : 0}
            volume={volume}
            isMuted={isMuted}
            isLiked={!!isLiked}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            isQueueOpen={isQueueOpen}
            onPlayPause={handlePlayPause}
            onPrev={prevTrack}
            onNext={nextTrack}
            onSeek={handleSeek}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
            onToggleShuffle={toggleShuffle}
            onCycleRepeat={cycleRepeatMode}
            onToggleQueue={toggleQueueSidebar}
            onLike={handleLike}
            onAddToPlaylist={() => alert("Add to playlist coming soon.")}
            onExpand={() => alert("Expand player coming soon.")}
          />
          <PlayerQueueSidebar />
        </div>
      )}
    </>
  );
};


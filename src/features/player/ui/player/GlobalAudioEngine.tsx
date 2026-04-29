'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../model/playerStore';
import { PlayerBar } from '@/shared/ui/PlayerBar/PlayerBar';
import { PlayerQueueSidebar } from './PlayerQueueSidebar';
import { DEMO_TRACKS } from '../../model/mockTracks';

import Hls from 'hls.js';
import { useHistoryStore } from '../../model/historyStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';

export const GlobalAudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isSeekingRef = useRef(false);
  
  const {
    currentTrack,
    contextTitle,
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

  // Initialize Web Audio API nodes
  useEffect(() => {
    if (!audioRef.current) return;
    if (audioContextRef.current) return; // Only init once

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const gain = ctx.createGain();
      const source = ctx.createMediaElementSource(audioRef.current);

      source.connect(gain);
      gain.connect(ctx.destination);

      audioContextRef.current = ctx;
      gainNodeRef.current = gain;
      sourceNodeRef.current = source;

      // Initial gain sync
      gain.gain.value = isMuted ? 0 : volume;
    } catch (err) {
      console.warn('Web Audio API not supported or failed to init:', err);
    }
  }, []);

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

  // 1. Sync Audio Element & Gain Node with Zustand State
  useEffect(() => {
    // 1a. Standard fallback (works on desktop)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    // 1b. Web Audio Gain (works on mobile/iOS)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentTrack]);

  // 2. Handle Source Loading (HLS vs Normal)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playbackSource === 'inline') return;

    const url = currentTrack?.streamUrl || currentTrack?.hlsUrl;
    if (!url) {
      audio.src = '';
      return;
    }

    const isHls = url.includes('.m3u8');

    if (isHls) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        audio.src = url;
      }
    } else {
      // Normal progressive download
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.src = url;
    }
  }, [currentTrack?.id, currentTrack?.streamUrl, currentTrack?.hlsUrl, playbackSource]);

  // 3. Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Only control the hidden <audio> when source is 'global'
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

      // Resume context on play to satisfy browser policy
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Autoplay prevented or interrupted:", e);
          // Only pause state if it was a true failure, not an abort
          if (e.name !== 'AbortError') pause();
        });
      }
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
  }, [isPlaying, currentTrack?.id, playbackSource]);

  // 2. Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      // Skip if we are in the middle of a seek — prevents snap-back
      if (isSeekingRef.current) return;
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
    // Set guard — cleared by native onSeeked event on the <audio> element
    isSeekingRef.current = true;
    seek(time);
    if (playbackSource === 'global' && audioRef.current) {
      audioRef.current.currentTime = time;
    }
    // Dispatch a custom event so the active WaveformPlayer can sync its visuals
    if (playbackSource === 'inline') {
      window.dispatchEvent(new CustomEvent('playerbar-seek', { detail: { time } }));
    }
  };
  
  useEffect(() => {
    const onGlobalSeek = (e: any) => {
      if (e.detail?.time !== undefined && audioRef.current) {
        // Guard cleared by native onSeeked — no setTimeout needed
        isSeekingRef.current = true;
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
        onSeeking={() => {
          isSeekingRef.current = true;
        }}
        onSeeked={() => {
          isSeekingRef.current = false;
          // Push confirmed position to store
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          // Notify WaveformPlayer to clear its own seeking guard
          window.dispatchEvent(new CustomEvent('playerbar-seeked'));
        }}
        crossOrigin="anonymous"
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
            contextTitle={contextTitle}
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


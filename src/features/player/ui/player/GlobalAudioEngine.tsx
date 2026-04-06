'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../model/playerStore';
import { PlayerBar } from '@/shared/ui/PlayerBar/PlayerBar';
import { PlayerQueueSidebar } from './PlayerQueueSidebar';

import { useHistoryStore } from '../../model/historyStore';

export const GlobalAudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    isShuffle,
    repeatMode,
    isQueueOpen,
    playbackSource,
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
    toggleShuffle,
    cycleRepeatMode,
    toggleQueueSidebar,
  } = usePlayerStore();

  const [hasStarted, setHasStarted] = useState(false);

  // 1. Sync Audio Element with Zustand State
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Only control the hidden <audio> when source is 'global'
    // When 'inline', WaveformPlayer handles the actual audio
    if (playbackSource === 'inline') {
      audioRef.current.pause();
      return;
    }

    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn("Autoplay prevented:", e);
        pause();
      });
      setHasStarted(true);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, playbackSource]);

  // 2. Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
    if (currentTrack) {
      useHistoryStore.getState().addToHistory(currentTrack, audioRef.current?.currentTime);
    }
    nextTrack();
  };

  const handleSeek = (time: number) => {
    if (playbackSource === 'global' && audioRef.current) {
      audioRef.current.currentTime = time;
    }
    // Dispatch a custom event so the active WaveformPlayer can sync
    if (playbackSource === 'inline') {
      window.dispatchEvent(new CustomEvent('playerbar-seek', { detail: { time } }));
    }
    seek(time);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
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
        src={currentTrack?.hlsUrl || undefined}
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
            duration={audioRef.current?.duration || currentTrack.duration || 0}
            buffered={audioRef.current?.buffered.length ? audioRef.current.buffered.end(0) / (audioRef.current.duration || 1) : 0}
            volume={volume}
            isMuted={isMuted}
            isLiked={false} // Will hook up to real API later
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
          />
          <PlayerQueueSidebar />
        </div>
      )}
    </>
  );
};

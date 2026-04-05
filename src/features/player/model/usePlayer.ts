'use client';

import { usePlayerStore } from './playerStore';

export function usePlayer() {
  const currentTrack  = usePlayerStore((s) => s.currentTrack);
  const isPlaying     = usePlayerStore((s) => s.isPlaying);
  const duration      = usePlayerStore((s) => s.duration);
  const currentTime   = usePlayerStore((s) => s.currentTime);
  const volume        = usePlayerStore((s) => s.volume);
  const isMuted       = usePlayerStore((s) => s.isMuted);
  const buffered      = usePlayerStore((s) => s.buffered);
  const queue         = usePlayerStore((s) => s.queue);

  const play          = usePlayerStore((s) => s.play);
  const pause         = usePlayerStore((s) => s.pause);
  const seek          = usePlayerStore((s) => s.seek);
  const setVolume     = usePlayerStore((s) => s.setVolume);
  const toggleMute    = usePlayerStore((s) => s.toggleMute);
  const nextTrack     = usePlayerStore((s) => s.nextTrack);
  const prevTrack     = usePlayerStore((s) => s.prevTrack);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration   = usePlayerStore((s) => s.setDuration);
  const setBuffered   = usePlayerStore((s) => s.setBuffered);
  const setQueue      = usePlayerStore((s) => s.setQueue);

  return {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    buffered,
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
  };
}

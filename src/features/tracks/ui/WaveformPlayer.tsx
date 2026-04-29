"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { AppButton } from "@/shared/ui";
import { Pause, Play } from "lucide-react";
import { usePlayerStore } from "@/features/player/model/playerStore";

interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  hlsUrl?: string;
}

export interface WaveformComment {
  id: string;
  timestampSeconds: number;
  text: string;
  username: string;
  avatarUrl?: string | null;
}

interface WaveformPlayerProps {
  audioUrl?: string;
  waveform?: number[];
  comments?: WaveformComment[];
  onTimeUpdate?: (currentTime: number) => void;
  trackMeta?: TrackMeta;
  hidePlayButton?: boolean;
  durationSeconds?: number;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  waveform,
  comments = [],
  onTimeUpdate,
  trackMeta,
  hidePlayButton,
  durationSeconds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isSeekingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoveredComment, setHoveredComment] = useState<WaveformComment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Top half is solid grey, bottom half is semi-transparent grey acting as reflection
    const waveGradient = ctx.createLinearGradient(0, 0, 0, 80);
    waveGradient.addColorStop(0, '#999999');
    waveGradient.addColorStop(0.65, '#999999');
    waveGradient.addColorStop(0.65, 'transparent');
    waveGradient.addColorStop(0.67, 'rgba(153, 153, 153, 0.4)');
    waveGradient.addColorStop(1, 'rgba(153, 153, 153, 0.4)');

    // Top half is solid orange, bottom half is semi-transparent orange acting as reflection
    const progGradient = ctx.createLinearGradient(0, 0, 0, 80);
    progGradient.addColorStop(0, '#f97316');
    progGradient.addColorStop(0.65, '#f97316');
    progGradient.addColorStop(0.65, 'transparent');
    progGradient.addColorStop(0.67, 'rgba(249, 115, 22, 0.4)');
    progGradient.addColorStop(1, 'rgba(249, 115, 22, 0.4)');

    const style = getComputedStyle(document.documentElement);
    const cursorColor = style.getPropertyValue("--sc-wave-cursor").trim() || "#ffffff";

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveGradient,
      progressColor: progGradient,
      cursorColor,
      cursorWidth: 1, // thinner cursor like SC
      barWidth: 1.5, // denser bars
      barRadius: 1,
      barGap: 1, // closer bars like SC
      height: 80,
      normalize: true,
    });

    wavesurferRef.current = ws;
    
    // Set initial volume
    const globalState = usePlayerStore.getState();
    ws.setVolume(globalState.isMuted ? 0 : globalState.volume);

    ws.on("ready", () => {
      setIsReady(true);
      const dur = ws.getDuration();
      setDuration(dur);
      // If this waveform is active, push duration to the global player bar
      if (usePlayerStore.getState().playbackSource === 'inline') {
        usePlayerStore.getState().setDuration(dur);
      }
    });

    ws.on("audioprocess", () => {
      const time = ws.getCurrentTime();
      setCurrentTime(time);
      onTimeUpdate?.(time);
      // Sync to global player bar if this waveform is the active source
      if (usePlayerStore.getState().playbackSource === 'inline') {
        usePlayerStore.getState().setCurrentTime(time);
      }
    });

    const syncWaveformSeek = (time?: number) => {
      const seekTime = typeof time === 'number' ? time : ws.getCurrentTime();
      setCurrentTime(seekTime);
      onTimeUpdate?.(seekTime);

      const store = usePlayerStore.getState();
      const isThisTrack = trackMeta && store.currentTrack?.id === trackMeta.id;
      if (isThisTrack) {
        const dur = ws.getDuration();
        if (dur > 0) store.setDuration(dur);
        // Set seeking guard — cleared by 'playerbar-seeked' event from GlobalAudioEngine
        isSeekingRef.current = true;
        store.seek(seekTime);
        // Tell GlobalAudioEngine to seek the actual <audio> element
        window.dispatchEvent(new CustomEvent('playerbar-seek', { detail: { time: seekTime } }));
      }
    };

    (ws.on as any)("seeking", syncWaveformSeek);
    (ws.on as any)("interaction", syncWaveformSeek);

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onTimeUpdate?.(0);
      // Trigger the global player's next track logic (handles repeat/shuffle)
      if (usePlayerStore.getState().playbackSource === 'inline') {
        usePlayerStore.getState().nextTrack();
      }
    });

    // ─── PEAK PROCESSING ───
    // Trust the backend waveform if it has any data.
    const maxVal = Array.isArray(waveform) && waveform.length > 0 ? Math.max(...waveform) : 0;
    const hasData = maxVal > 0;
    
    let processedPeaks: number[] = [];

    if (hasData) {
      // Determine the scale: if maxVal > 1.0, it's likely 0-100 or 0-255.
      // We divide by the likely max (100 or 255) to normalize to 0-1.
      const scale = maxVal > 100 ? 255 : (maxVal > 1.0 ? 100 : 1);
      processedPeaks = waveform!.map(v => v / scale);

      // If the backend provides very few peaks (e.g. 10-20), interpolate them to 180 
      // so it looks "dense" instead of "boxy".
      if (processedPeaks.length < 100) {
        const targetLen = 180;
        const interpolated: number[] = [];
        for (let i = 0; i < targetLen; i++) {
          const pos = (i / (targetLen - 1)) * (processedPeaks.length - 1);
          const idx = Math.floor(pos);
          const fraction = pos - idx;
          const v1 = processedPeaks[idx];
          const v2 = processedPeaks[Math.min(idx + 1, processedPeaks.length - 1)];
          interpolated.push(v1 + (v2 - v1) * fraction);
        }
        processedPeaks = interpolated;
      }
    } else {
      // Fallback: Generate a high-resolution deterministic waveform
      processedPeaks = Array.from({ length: 180 }, (_, i) => {
        const x = i / 180;
        const p = Math.sin(x * Math.PI * 3) * Math.cos(x * Math.PI * 11) * Math.sin(x * Math.PI * 5);
        const val = Math.abs(p) * 0.7 + (Math.random() * 0.1) + 0.1;
        return Math.min(1, val);
      });
    }

    const peaks = processedPeaks;

    // If audioUrl is a local blob (e.g., during track upload), WaveSurfer can natively decode it to extract highly accurate peaks.
    // If audioUrl is a backend HLS playlist (.m3u8), WaveSurfer CANNOT decode it. Attempting to load it directly would crash silently.
    // Therefore, for anything other than a blob URL, we MUST create a silent dummy audio buffer and pass the pre-calculated peaks.
    // This also elegantly prevents double-audio because the Global Player handles actual m3u8 playback.
    if (audioUrl && audioUrl.startsWith('blob:')) {
      ws.load(audioUrl);
    } else {
      const sampleRate = 44100;
      const fakeDuration = durationSeconds && durationSeconds > 0 ? durationSeconds : 30;
      const buffer = new AudioContext().createBuffer(1, sampleRate * fakeDuration, sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < channelData.length; i++) channelData[i] = 0; // Silent audio

      const blob = bufferToWaveBlob(buffer);
      const dummyUrl = URL.createObjectURL(blob);
      
      // Load the silent audio and explicitly declare the visual peaks and duration!
      ws.load(dummyUrl, [peaks], fakeDuration);
    }

    return () => {
      try {
        ws.destroy();
      } catch (err) {
        // Ignore abort errors on cleanup
      }
    };
  }, [audioUrl, waveform]);

  // 1. Sync Play/Pause and scrubbing (Track-specific)
  useEffect(() => {
    if (!trackMeta) return;

    return usePlayerStore.subscribe((state) => {
      const ws = wavesurferRef.current;
      if (!ws) return;

      const isThisTrack = state.currentTrack?.id === trackMeta.id;

      // Sync Play/Pause
      if (isThisTrack) {
        if (state.isPlaying && !ws.isPlaying()) {
          ws.play();
        } else if (!state.isPlaying && ws.isPlaying()) {
          ws.pause();
        }
      } else {
        if (ws.isPlaying()) {
          ws.stop();
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }

      // Sync Global Player scrubbing -> Waveform visual playhead
      if (isThisTrack && typeof state.currentTime === 'number' && !isSeekingRef.current) {
        const wsTime = ws.getCurrentTime();
        if (Math.abs(wsTime - state.currentTime) > 0.5) {
          const dur = ws.getDuration();
          if (dur > 0) {
            ws.seekTo(state.currentTime / dur);
          }
        }
      }
    });
  }, [trackMeta]);

  // 1b. Listen for confirmed seek completion from the <audio> element
  // This clears the isSeekingRef reliably after HLS finishes buffering
  useEffect(() => {
    const onSeeked = () => { isSeekingRef.current = false; };
    window.addEventListener('playerbar-seeked', onSeeked);
    return () => window.removeEventListener('playerbar-seeked', onSeeked);
  }, []);

  // 2. Sync Global Volume (Universal)
  useEffect(() => {
    return usePlayerStore.subscribe((state) => {
      const ws = wavesurferRef.current;
      if (!ws) return;
      ws.setVolume(state.isMuted ? 0 : state.volume);
    });
  }, []);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
    // Also push to global player bar if track metadata is available
    if (trackMeta && !isPlaying) {
      const store = usePlayerStore.getState();
      store.play({
        id: trackMeta.id,
        title: trackMeta.title,
        artist: trackMeta.artist,
        artworkUrl: trackMeta.artworkUrl || '/placeholder.png',
        hlsUrl: trackMeta.hlsUrl || audioUrl,
      }, 'inline');
      
      usePlayerStore.setState({ 
        duration: wavesurferRef.current?.getDuration() || 0,
      });
    } else if (isPlaying) {
      usePlayerStore.getState().pause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate marker positions as % of duration
  const commentMarkers = isReady && duration > 0
    ? comments.map((c) => ({
        ...c,
        position: Math.min((c.timestampSeconds / duration) * 100, 100),
      }))
    : [];

  return (
    <div data-testid="waveform-player" className="w-full">
      <div className="flex items-center gap-6">
        {!hidePlayButton && (
          <AppButton
            data-testid="track-play-button"
            type="button"
            onClick={togglePlay}
            className="h-14 w-14 shrink-0 rounded-full bg-orange-500 text-white grid place-items-center hover:bg-orange-400 hover:scale-105 transition-all focus:outline-none shadow-[0_0_15px_rgba(249,115,22,0.3)] pointer-events-auto cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" className="ml-1" />
            )}
          </AppButton>
        )}

        <div className="flex-1 min-w-0 pointer-events-auto relative">
          <div ref={containerRef} className="w-full" />

          {/* ── Comment avatar markers ON the waveform ── */}
          {commentMarkers.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 20,
                pointerEvents: 'none',
              }}
            >
              {commentMarkers.map((marker) => (
                <div
                  key={marker.id}
                  data-testid={`comment-marker-${marker.id}`}
                  style={{
                    position: 'absolute',
                    left: `${marker.position}%`,
                    bottom: 0,
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                    setHoveredComment(marker);
                  }}
                  onMouseLeave={() => setHoveredComment(null)}
                >
                  {/* Circle avatar marker */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: marker.avatarUrl
                        ? `url(${marker.avatarUrl}) center/cover`
                        : 'linear-gradient(135deg, #f97316, #8b5cf6)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      transition: 'transform 150ms ease, box-shadow 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.3)';
                      e.currentTarget.style.boxShadow = '0 0 6px rgba(255,85,0,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── Username label below waveform (shows first commenter) ── */}
          {commentMarkers.length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${commentMarkers[0].position}%`,
                bottom: 18,
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#ccc', fontSize: 11, fontWeight: 500 }}>
                {commentMarkers[0].username}
              </span>
            </div>
          )}

          {/* Comment tooltip on hover */}
          {hoveredComment && (
            <div
              data-testid="comment-tooltip"
              style={{
                position: 'fixed',
                left: tooltipPos.x,
                top: tooltipPos.y - 8,
                transform: 'translate(-50%, -100%)',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 6,
                padding: '6px 10px',
                maxWidth: 220,
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ color: '#ccc', fontSize: 11, fontWeight: 600 }}>
                {hoveredComment.username}
              </div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                {hoveredComment.text}
              </div>
            </div>
          )}

          <div className="mt-2 flex justify-between text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            <span data-testid="waveform-current-time" style={{ color: '#f50' }}>{formatTime(currentTime)}</span>
            <span data-testid="waveform-duration">{isReady ? formatTime(duration) : "0:00"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function bufferToWaveBlob(abuffer: AudioBuffer) {
  var numOfChan = abuffer.numberOfChannels,
    length = abuffer.length * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [],
    i,
    sample,
    offset = 0,
    pos = 0;

  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export { WaveformPlayer };
export default WaveformPlayer;

"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { AppButton } from "@/shared/ui";
import { Pause, Play } from "lucide-react";

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
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  waveform,
  comments = [],
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoveredComment, setHoveredComment] = useState<WaveformComment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const style = getComputedStyle(document.documentElement);
    const waveColor = style.getPropertyValue("--sc-wave-bar").trim() || "#404040";
    const progressColor = style.getPropertyValue("--sc-wave-progress").trim() || "#f97316";
    const cursorColor = style.getPropertyValue("--sc-wave-cursor").trim() || "#ffffff";

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth: 2,
      barWidth: 4,
      barRadius: 2,
      barGap: 3,
      height: 80,
      normalize: true,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });

    ws.on("audioprocess", () => {
      const t = ws.getCurrentTime();
      setCurrentTime(t);
      onTimeUpdate?.(t);
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onTimeUpdate?.(0);
    });

    if (audioUrl) {
      ws.load(audioUrl);
    } else {
      const sampleRate = 44100;
      const fakeDuration = 30;
      const buffer = new AudioContext().createBuffer(1, sampleRate * fakeDuration, sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < channelData.length; i++) channelData[i] = 0;

      const peaks = waveform
        ? waveform.map((v) => v / 100)
        : Array.from({ length: 80 }, (_, i) => (14 + ((i * 11) % 52)) / 100);

      const blob = bufferToWaveBlob(buffer);
      const url = URL.createObjectURL(blob);
      ws.load(url, [peaks]);
    }

    return () => { ws.destroy(); };
  }, [audioUrl, waveform]);

  const togglePlay = () => {
    if (wavesurferRef.current) wavesurferRef.current.playPause();
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

export default WaveformPlayer;

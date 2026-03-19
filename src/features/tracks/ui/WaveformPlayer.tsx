"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { AppButton } from "@/shared/ui";
import { Pause, Play } from "lucide-react";

interface WaveformPlayerProps {
  audioUrl?: string; // Add audioUrl for real audio if available
  waveform?: number[];
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  waveform,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // Default waveform is now only used if neither url nor peaks exist, but we should generate mock audio for peaks
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
      height: 80, // larger height
      normalize: true,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });

    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    if (audioUrl) {
      ws.load(audioUrl);
    } else {
      // Create a dummy silent audio track to allow playback of the mock waveform
      const sampleRate = 44100;
      const fakeDuration = 30; // 30 seconds
      const buffer = new AudioContext().createBuffer(
        1,
        sampleRate * fakeDuration,
        sampleRate,
      );

      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = 0; // silence
      }

      const peaks = waveform
        ? waveform.map((v) => v / 100)
        : Array.from({ length: 80 }, (_, i) => (14 + ((i * 11) % 52)) / 100);

      // Load silence with mock peaks
      const blob = bufferToWaveBlob(buffer);
      const url = URL.createObjectURL(blob);
      ws.load(url, [peaks]);
    }

    return () => {
      ws.destroy();
    };
  }, [audioUrl, waveform]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-6">
        <AppButton
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

        <div className="flex-1 min-w-0 pointer-events-auto">
          <div ref={containerRef} className="w-full" />
          <div className="mt-2 flex justify-between text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            <span>{formatTime(currentTime)}</span>
            <span>{isReady ? formatTime(duration) : "0:00"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to create silent audio blob
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

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export default WaveformPlayer;

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface RecordSectionProps {
  onRecordingComplete: (file: File) => void;
}

const RecordSection: React.FC<RecordSectionProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
        onRecordingComplete(file);
        setHasRecording(true);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } catch {
      console.warn('Microphone access denied');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const deleteRecording = useCallback(() => {
    setHasRecording(false);
    setElapsed(0);
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div style={{
      marginTop: 32,
      padding: '28px 32px',
      background: '#1a1a1a',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        {/* Microphone icon */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
            Or record with a microphone
          </h3>
          <p style={{ fontSize: 12, color: '#777', marginTop: 2, margin: 0 }}>
            Record audio directly from your device
          </p>
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Start/Stop button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 24,
            background: isRecording ? '#ff3333' : 'rgba(255,255,255,0.08)',
            border: isRecording ? 'none' : '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 200ms',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: isRecording ? 2 : '50%',
            background: isRecording ? '#fff' : '#ff3333',
            display: 'inline-block',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
          }} />
          {isRecording ? 'Stop recording' : 'Start recording'}
        </button>

        {/* Timer */}
        <span style={{
          fontSize: 20, fontWeight: 700, fontFamily: 'monospace',
          color: isRecording ? '#ff5500' : '#555',
          minWidth: 60,
        }}>
          {formatTime(elapsed)}
        </span>

        {/* Delete button */}
        {hasRecording && !isRecording && (
          <button
            onClick={deleteRecording}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#999', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Delete recording"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default RecordSection;

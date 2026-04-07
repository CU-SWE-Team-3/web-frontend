'use client';

import React, { FC, useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { usePostComment } from '../model/usePostComment';

export interface CommentInputProps {
  trackId: string;
  currentTime: number; // Current playback time in seconds
  userAvatarUrl?: string | null;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const CommentInput: FC<CommentInputProps> = ({
  trackId,
  currentTime,
  userAvatarUrl,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const [text, setText] = useState('');
  const postMutation = usePostComment(trackId);

  const handleSubmit = useCallback(() => {
    if (!text.trim() || !isAuthenticated) return;

    const timestamp = Math.floor(currentTime);
    postMutation.mutate(
      { text: text.trim(), timestampSeconds: timestamp },
      {
        onSuccess: () => setText(''),
      }
    );
  }, [text, currentTime, isAuthenticated, postMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auth check removed for dev — always show comment input

  return (
    <div
      data-testid="comment-input"
      style={{
        background: '#1a1a1a',
        height: 28,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid #333',
        padding: '0 8px',
        width: '100%',
        maxWidth: 500,
      }}
    >
      {/* User avatar */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {userAvatarUrl && (
          <img
            src={userAvatarUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Input */}
      <input
        data-testid="comment-text-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          fontSize: 12,
          color: '#fff',
          outline: 'none',
          fontFamily: 'var(--sc-font-family)',
        }}
      />

      {/* Timestamp badge */}
      {text.trim() && (
        <span
          data-testid="comment-timestamp-badge"
          style={{
            color: '#ff5500',
            fontSize: 10,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          at {formatTimestamp(currentTime)}
        </span>
      )}

      {/* Send button */}
      <button
        data-testid="comment-submit-button"
        onClick={handleSubmit}
        disabled={!text.trim() || postMutation.isPending}
        style={{
          background: 'none',
          border: 'none',
          color: text.trim() ? '#ff5500' : '#666',
          cursor: text.trim() ? 'pointer' : 'default',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          transition: 'color 200ms',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
};

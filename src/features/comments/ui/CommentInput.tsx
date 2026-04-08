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
    if (!text.trim()) return;

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
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        marginTop: 4,
      }}
    >
      {/* User avatar (Outside the input box, larger) */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
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

      {/* Input container (Rounded rectangle) */}
      <div style={{
        flex: 1,
        background: '#242424',
        height: 36,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px 0 12px',
        border: '1px solid #333',
        transition: 'border-color 200ms, background 200ms',
      }}>
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
            fontSize: 13,
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
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginRight: 8,
            }}
          >
            at {formatTimestamp(currentTime)}
          </span>
        )}

        {/* Send button (Inside input box on the far right) */}
        <button
          data-testid="comment-submit-button"
          onClick={handleSubmit}
          disabled={!text.trim() || postMutation.isPending}
          style={{
            background: 'none',
            border: 'none',
            color: text.trim() ? '#ff5500' : '#888',
            cursor: text.trim() ? 'pointer' : 'default',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'color 200ms',
            height: 28,
            width: 28,
            borderRadius: 4,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

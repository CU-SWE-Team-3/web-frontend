'use client';

import React, { FC } from 'react';
import type { TrackComment } from '../model/types';

export interface CommentListProps {
  comments: TrackComment[];
  isLoading?: boolean;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const CommentList: FC<CommentListProps> = ({ comments, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '16px 0', color: '#666', fontSize: 12 }}>
        Loading comments...
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return null; // Don't show anything if no comments
  }

  // Sort by timestamp
  const sorted = [...comments].sort(
    (a, b) => a.timestampSeconds - b.timestampSeconds
  );

  return (
    <div data-testid="comment-list" style={{ marginTop: 16 }}>
      {sorted.map((comment) => (
        <div
          key={comment.id}
          data-testid={`comment-item-${comment.id}`}
          style={{
            display: 'flex',
            gap: 10,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {comment.avatarUrl && (
              <img
                src={comment.avatarUrl}
                alt={comment.displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          {/* Comment body */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  color: '#ccc',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {comment.displayName || comment.username}
              </span>
              <span
                style={{
                  color: '#ff5500',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                at {formatTimestamp(comment.timestampSeconds)}
              </span>
              <span style={{ color: '#555', fontSize: 11, marginLeft: 'auto' }}>
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <div
              style={{
                color: '#999',
                fontSize: 13,
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {comment.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

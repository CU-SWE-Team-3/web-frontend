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
  const { isAuthenticated } = useAuthStore();
  const [text, setText] = useState('');
  const postMutation = usePostComment(trackId);
  const timestampLabel = formatTimestamp(currentTime);

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

  // Auth check removed for dev - always show comment input.
  return (
    <div
      data-testid="comment-input"
      className="mt-1 flex w-full items-start gap-3 rounded border border-[#333] bg-[#171717] p-2 sm:items-center"
    >
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-violet-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
        {userAvatarUrl && (
          <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-1">
          <span className="text-[12px] font-semibold text-[#ccc]">
            Write a timed comment
          </span>
          <span
            data-testid="comment-timestamp-badge"
            className="shrink-0 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-2 py-0.5 text-[11px] font-bold text-[#ff5500]"
          >
            at {timestampLabel}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 rounded border border-[#333] bg-[#242424] px-3 transition-colors focus-within:border-[#ff5500]/60">
          <input
            data-testid="comment-text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Comment at ${timestampLabel}`}
            className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#888]"
            style={{ fontFamily: 'var(--sc-font-family)' }}
          />

          <button
            data-testid="comment-submit-button"
            onClick={handleSubmit}
            disabled={!text.trim() || postMutation.isPending}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded transition-colors ${
              text.trim()
                ? 'cursor-pointer text-[#ff5500] hover:bg-white/5'
                : 'cursor-default text-[#888]'
            }`}
            aria-label="Send timed comment"
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
    </div>
  );
};

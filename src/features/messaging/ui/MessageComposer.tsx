'use client';

import React, { useState } from 'react';
import s from './MessagesPage.module.scss';

interface MessageComposerProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTyping,
  disabled = false,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping?.();
  };

  return (
    <div className={s.composer} data-testid="message-composer">
      <label className={s.composerLabel}>
        Write your message and add tracks or playlists<span>*</span>
      </label>
      <textarea
        className={s.composerTextarea}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        data-testid="message-composer-input"
      />
      <div className={s.composerActions}>
        <button
          className={s.sendBtn}
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          data-testid="message-send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

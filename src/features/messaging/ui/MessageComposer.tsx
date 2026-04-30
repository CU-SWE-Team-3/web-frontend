'use client';

import React, { useState } from 'react';
import s from './MessagesPage.module.scss';
import { AddAttachmentModal } from './AddAttachmentModal';

interface MessageComposerProps {
  onSend: (content: string, attachment?: { type: 'track' | 'playlist'; id: string }) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTyping,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [attachment, setAttachment] = useState<{ item: any; type: 'track' | 'playlist' } | null>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    const attachmentPayload = attachment
      ? { type: attachment.type, id: attachment.item.id || attachment.item._id }
      : undefined;

    // Backend requires non-empty content; fall back to a space when only an attachment is sent
    const contentToSend = trimmed || ' ';

    onSend(contentToSend, attachmentPayload);

    setText('');
    setAttachment(null);
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
      <div style={{ position: 'relative' }}>
        <textarea
          className={s.composerTextarea}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder=""
          disabled={disabled}
          data-testid="message-textarea"
        />
        
        {attachment && (
          <div style={{ 
            position: 'absolute', bottom: 8, left: 12, right: 12, 
            background: '#1a1a1a', border: '1px solid #f50', borderRadius: 4, 
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 2, background: '#333', overflow: 'hidden', flexShrink: 0 }}>
              {(attachment.item.artworkUrl || attachment.item.artwork_url) && (
                <img src={attachment.item.artworkUrl || attachment.item.artwork_url} alt={attachment.item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
               <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment.item.title}</div>
               <div style={{ fontSize: 10, color: '#999' }}>{attachment.type === 'track' ? 'Track' : 'Playlist'} selected</div>
            </div>
            <button 
              onClick={() => setAttachment(null)}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className={s.composerActions}>
        <button
          className={s.addTrackBtn}
          onClick={() => setShowAddModal(true)}
        >
          Add track or playlist
        </button>

        <button
          className={s.sendBtn}
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !attachment)}
          data-testid="send-message-button"
        >
          Send
        </button>
      </div>

      <AddAttachmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelectTrack={(item, type) => setAttachment({ item, type })}
      />
    </div>
  );
};

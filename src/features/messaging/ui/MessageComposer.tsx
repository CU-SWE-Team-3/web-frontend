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
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedTrack) return;
    
    onSend(
      trimmed, 
      selectedTrack ? { type: 'track', id: selectedTrack.id } : undefined
    );
    
    setText('');
    setSelectedTrack(null);
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
      
      {/* Attachment Chip */}
      {selectedTrack && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#111', borderRadius: '4px 4px 0 0', border: '1px solid #333', borderBottom: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 3, background: '#333', overflow: 'hidden', flexShrink: 0 }}>
            {selectedTrack.artworkUrl && <img src={selectedTrack.artworkUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <span style={{ color: '#999', fontSize: 13, flex: 1 }}>
            {(typeof selectedTrack.artist === 'object' ? selectedTrack.artist?.displayName : selectedTrack.artist) || 'Unknown'}  ·  {selectedTrack.title}
          </span>
          <button
            onClick={() => setSelectedTrack(null)}
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
            title="Remove track"
          >×</button>
        </div>
      )}

      <textarea
        className={s.composerTextarea}
        style={selectedTrack ? { borderRadius: '0 0 4px 4px' } : undefined}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        data-testid="message-composer-input"
      />
      
      <div className={s.composerActions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: '#333', color: '#ccc', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#444')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#333')}
        >
          Add track or playlist
        </button>

        <button
          className={s.sendBtn}
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !selectedTrack)}
          data-testid="message-send-button"
        >
          Send
        </button>
      </div>

      <AddAttachmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelectTrack={(track) => setSelectedTrack(track)}
      />
    </div>
  );
};

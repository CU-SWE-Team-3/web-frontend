'use client';

import React, { useState, useCallback } from 'react';
import { searchUsers, resolveUserByPermalink } from '../api/messagingApi';
import type { MessageUser } from '../model/types';
import { useStartConversation } from '../model/useStartConversation';
import { CloseIcon } from '@/shared/ui/icons';
import { AddAttachmentModal } from './AddAttachmentModal';
import s from './MessagesPage.module.scss';

interface NewConversationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MessageUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MessageUser | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Validation states
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  const startConversationMutation = useStartConversation();

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setRecipientError(null); // Clear error on type
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const handleSelectUser = (user: MessageUser) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    setRecipientError(null);
  };

  const executeSend = (userId: string, content: string) => {
    startConversationMutation.mutate(
      { 
        userId, 
        content,
        attachment: selectedTrack ? { type: 'track', id: selectedTrack.id } : undefined
      },
      {
        onSuccess: (conversation) => {
          onCreated(conversation._id);
          handleReset();
        },
      }
    );
  };

  const handleSend = async () => {
    let hasError = false;

    if (!selectedUser && !searchQuery.trim()) {
      setRecipientError('Enter a recipient.');
      hasError = true;
    }
    
    if (!messageText.trim()) {
      setMessageError('Enter a message.');
      hasError = true;
    }

    if (hasError) return;

    if (selectedUser) {
      executeSend(selectedUser._id, messageText.trim());
    } else {
      // Fallback: User typed a name but didn't select from the dropdown.
      setResolving(true);
      let resolvedId = await resolveUserByPermalink(searchQuery.trim());
      
      // If permalink resolution fails (e.g. name with spaces), fallback to search
      if (!resolvedId) {
        try {
          const results = await searchUsers(searchQuery.trim());
          if (results && results.length > 0) {
            resolvedId = results[0]._id;
          }
        } catch {}
      }
      
      setResolving(false);

      if (resolvedId) {
        executeSend(resolvedId, messageText.trim());
      } else {
        setRecipientError("User not found. Please select from the dropdown or try a different name.");
      }
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setMessageText('');
    setSelectedTrack(null);
    setRecipientError(null);
    setMessageError(null);
    onClose();
  };

  if (!open) return null;

  const isSending = startConversationMutation.isPending || resolving;

  return (
    <div
      className={s.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReset();
      }}
      data-testid="new-conversation-modal"
    >
      <div className={s.modalContent}>
        {/* Header */}
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>New message</h2>
          <button
            className={s.modalClose}
            onClick={handleReset}
            data-testid="new-conv-close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={s.modalBody}>
          {/* To field */}
          <div className={s.modalField}>
            <label className={s.modalLabel}>
              To<span style={{ color: '#ff1f44' }}>*</span>
            </label>
            {selectedUser ? (
              <div className={s.selectedUser}>
                <div className={s.userResultAvatar}>
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt="" className={s.userResultAvatarImg} />
                  ) : (
                    <span className={s.userResultAvatarInitial}>{selectedUser.displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className={s.selectedUserName}>
                  {selectedUser.displayName}
                </span>
                <button
                  className={s.selectedUserRemove}
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <input
                  className={s.modalInput}
                  style={recipientError ? { borderColor: '#ff1f44' } : undefined}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  data-testid="user-search-input"
                />
                {recipientError && (
                  <div style={{ color: '#ff1f44', fontSize: 12, marginTop: 4 }}>
                    {recipientError}
                  </div>
                )}
                {(searchResults.length > 0 || searching) && !recipientError && (
                  <div className={s.userResults}>
                    {searching ? (
                      <div
                        style={{
                          padding: 12,
                          textAlign: 'center',
                          color: 'var(--sc-text-secondary)',
                          fontSize: 13,
                        }}
                      >
                        Searching...
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <button
                          key={user._id}
                          className={s.userResultItem}
                          onClick={() => handleSelectUser(user)}
                          data-testid={`user-result-${user._id}`}
                        >
                          <div className={s.userResultAvatar}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className={s.userResultAvatarImg} />
                            ) : (
                              <span className={s.userResultAvatarInitial}>{user.displayName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className={s.userResultName}>
                            {user.displayName}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Message field */}
          <div className={s.modalField}>
            <label className={s.modalLabel}>
              Write your message and add tracks or playlists<span style={{ color: '#ff1f44' }}>*</span>
            </label>
            <textarea
              className={s.modalTextarea}
              style={messageError ? { borderColor: '#ff1f44' } : undefined}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setMessageError(null);
              }}
              data-testid="new-conv-message-input"
            />
            {messageError && (
              <div style={{ color: '#ff1f44', fontSize: 12, marginTop: 4 }}>
                {messageError}
              </div>
            )}

            {/* Attached track preview */}
            {selectedTrack && (
              <div style={{ 
                marginTop: 12, padding: '8px 12px', background: '#111', borderRadius: 4, 
                border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
                    {selectedTrack.artworkUrl && <img src={selectedTrack.artworkUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedTrack.title}</div>
                </div>
                <button 
                  onClick={() => setSelectedTrack(null)}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 18 }}
                >×</button>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{ 
                  background: 'none', border: '1px solid #444', color: '#ccc', borderRadius: 4, 
                  padding: '6px 12px', fontSize: 12, cursor: 'pointer' 
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#666')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#444')}
              >
                Add track or playlist
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={s.modalFooter}>
          <button
            className={s.sendBtn}
            onClick={handleSend}
            disabled={isSending}
            style={{ opacity: isSending ? 0.7 : 1 }}
            data-testid="new-conv-send-button"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <AddAttachmentModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSelectTrack={setSelectedTrack}
        />
      </div>
    </div>
  );
};

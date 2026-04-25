'use client';

import React, { useState, useCallback } from 'react';
import { searchUsers, resolveUserByPermalink } from '../api/messagingApi';
import type { MessageUser } from '../model/types';
import { useStartConversation } from '../model/useStartConversation';
import { CloseIcon } from '@/shared/ui/icons';
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
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);

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
      { userId, content },
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
      // Attempt to resolve by permalink/username.
      setResolving(true);
      const resolvedId = await resolveUserByPermalink(searchQuery.trim());
      setResolving(false);

      if (resolvedId) {
        executeSend(resolvedId, messageText.trim());
      } else {
        setRecipientError("User not found. Please try a different username.");
      }
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setMessageText('');
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
                <div className={s.userResultAvatar} />
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
                          <div className={s.userResultAvatar} />
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
      </div>
    </div>
  );
};

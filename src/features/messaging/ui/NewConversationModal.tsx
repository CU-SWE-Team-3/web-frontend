'use client';

import React, { useState, useCallback } from 'react';
import { searchUsers } from '../api/messagingApi';
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

  const startConversationMutation = useStartConversation();

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
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
  };

  const handleSend = () => {
    if (!selectedUser || !messageText.trim()) return;

    startConversationMutation.mutate(
      {
        userId: selectedUser._id,
        content: messageText.trim(),
      },
      {
        onSuccess: (conversation) => {
          onCreated(conversation._id);
          handleReset();
        },
      }
    );
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setMessageText('');
    onClose();
  };

  if (!open) return null;

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
          <h2 className={s.modalTitle}>New Message</h2>
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
              To<span>*</span>
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
                  placeholder="Search for a user..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  data-testid="user-search-input"
                />
                {(searchResults.length > 0 || searching) && (
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
              Write your message and add tracks or playlists<span>*</span>
            </label>
            <textarea
              className={s.modalTextarea}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              data-testid="new-conv-message-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className={s.modalFooter}>
          <button
            className={s.sendBtn}
            onClick={handleSend}
            disabled={
              !selectedUser ||
              !messageText.trim() ||
              startConversationMutation.isPending
            }
            data-testid="new-conv-send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

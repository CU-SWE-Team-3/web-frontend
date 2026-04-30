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
  const [attachment, setAttachment] = useState<{ item: any; type: 'track' | 'playlist' } | null>(null);
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
        attachment: attachment ? { type: attachment.type, id: attachment.item.id || attachment.item._id } : undefined
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
      try {
        const resolved = await resolveUserByPermalink(searchQuery.trim());
        executeSend(resolved._id, messageText.trim());
      } catch {
        setRecipientError('Could not find this user.');
      } finally {
        setResolving(false);
      }
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setMessageText('');
    setAttachment(null);
    setRecipientError(null);
    setMessageError(null);
    onClose();
  };

  const isSending = startConversationMutation.isPending || resolving;

  if (!open) return null;

  return (
    <div 
      className={s.modalOverlay} 
      onClick={(e) => { if (e.target === e.currentTarget) handleReset(); }}
      data-testid="new-conversation-modal"
    >
      <div className={s.newConvModal}>
        {/* Header */}
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>New message</h2>
          <button onClick={handleReset} className={s.closeBtn}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className={s.modalBody}>
          {/* Recipient Search */}
          <div className={s.searchField}>
            <label className={s.fieldLabel}>To:</label>
            <div className={s.searchContainer}>
              {selectedUser ? (
                <div className={s.selectedUserChip}>
                  <span>{selectedUser.displayName}</span>
                  <button onClick={() => setSelectedUser(null)}>✕</button>
                </div>
              ) : (
                <input
                  type="text"
                  className={s.searchInput}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Enter a name or permalink"
                  autoFocus
                  data-testid="recipient-search-input"
                />
              )}
            </div>
            {recipientError && <div className={s.errorText}>{recipientError}</div>}
            
            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className={s.searchResultsDropdown}>
                {searchResults.map(user => (
                  <div 
                    key={user._id} 
                    className={s.searchResultItem}
                    onClick={() => handleSelectUser(user)}
                    data-testid={`search-result-${user._id}`}
                  >
                    <div className={s.searchResultAvatar}>
                      {user.avatarUrl && <img src={user.avatarUrl} alt="" />}
                    </div>
                    <div className={s.searchResultInfo}>
                      <span className={s.searchResultName}>{user.displayName}</span>
                      <span className={s.searchResultPermalink}>@{user.permalink}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searching && <div className={s.searchingIndicator}>Searching...</div>}
          </div>

          {/* Message Area */}
          <div className={s.messageField}>
            <label className={s.fieldLabel}>Message:</label>
            <div style={{ position: 'relative' }}>
              <textarea
                className={s.messageTextarea}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setMessageError(null);
                }}
                placeholder="Write something..."
                data-testid="new-conv-message-input"
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
            {messageError && <div className={s.errorText}>{messageError}</div>}
            
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
          onSelectTrack={(item, type) => setAttachment({ item, type })}
        />
      </div>
    </div>
  );
};

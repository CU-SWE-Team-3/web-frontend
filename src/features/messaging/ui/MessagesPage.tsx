'use client';

import React, { useState, useMemo } from 'react';
import { useConversations } from '../model/useConversations';
import { ConversationList } from './ConversationList';
import { ConversationView } from './ConversationView';
import { NavBar } from '@/shared/ui/NavBar';
import s from './MessagesPage.module.scss';

export const MessagesPage: React.FC = () => {
  const { data: conversations = [], isLoading } = useConversations();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c._id === activeConvId) ?? null,
    [conversations, activeConvId]
  );

  const handleConversationCreated = (conversationId: string) => {
    setActiveConvId(conversationId);
  };

  const handleDeleted = () => {
    setActiveConvId(null);
  };

  return (
    <div className={s.pageWrapper}>
      <NavBar />
      <div className={s.messagesLayout} data-testid="messages-page">
        {/* Left sidebar */}
      <div className={s.sidebar} data-testid="messages-sidebar">
        <div className={s.sidebarHeader}>
          <h1 className={s.sidebarTitle}>Messages</h1>
          <button
            className={s.newBtn}
            onClick={() => setShowNewModal(true)}
            data-testid="new-message-button"
          >
            New
          </button>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--sc-text-secondary)',
              fontSize: 14,
            }}
          >
            Loading...
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            onSelect={setActiveConvId}
          />
        )}
      </div>

      {/* Right chat panel */}
      {activeConversation ? (
        <ConversationView
          key={activeConversation._id}
          conversation={activeConversation}
          onDeleted={handleDeleted}
        />
      ) : (
        <div className={s.chatPanel} data-testid="messages-chat-empty">
          <div className={s.emptyChat}>
            Select a conversation to start messaging
          </div>
        </div>
      )}

      {/* New conversation modal */}
      <NewConversationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleConversationCreated}
      />
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Conversation } from '../model/types';
import { useMessages } from '../model/useMessages';
import { useSendMessage } from '../model/useSendMessage';
import { useBlockUser, useUnblockUser } from '../model/useBlockUser';
import { useMarkAsRead } from '../model/useMarkAsRead';
import { useDeleteConversation } from '../model/useDeleteConversation';
import { useSocket } from '../model/useSocket';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { BlockUserModal } from './BlockUserModal';
import { ReportUserModal } from './ReportUserModal';
import { DeleteConversationPopover } from './DeleteConversationPopover';
import s from './MessagesPage.module.scss';

interface ConversationViewProps {
  conversation: Conversation;
  onDeleted: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onDeleted,
}) => {
  const { data: messages = [], isLoading } = useMessages(conversation._id);
  const sendMessageMutation = useSendMessage();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteConversation();
  const { typingUsers, emitMarkAsRead, emitTyping, emitStopTyping } = useSocket();
  const threadRef = useRef<HTMLDivElement>(null);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeletePopover, setShowDeletePopover] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get current user id for identifying own messages
  const getCurrentUserId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        return u._id || u.id || '';
      }
    } catch { /* noop */ }
    return '';
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read when opening (REST + Socket)
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversation._id);
    }
    emitMarkAsRead(conversation._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]);

  const handleSend = (content: string) => {
    emitStopTyping(conversation.participant._id);
    sendMessageMutation.mutate({
      conversationId: conversation._id,
      content,
    });
  };

  const handleTyping = useCallback(() => {
    emitTyping(conversation.participant._id);
  }, [emitTyping, conversation.participant._id]);

  const handleBlockConfirm = (options: { removeContent: boolean; reportSpam: boolean }) => {
    if (conversation.isBlocked) {
      unblockMutation.mutate(conversation.participant._id);
    } else {
      blockMutation.mutate(conversation.participant._id);
    }
    setShowBlockModal(false);
  };

  const handleBlock = () => {
    if (conversation.isBlocked) {
      unblockMutation.mutate(conversation.participant._id);
    } else {
      setShowBlockModal(true);
    }
  };

  const handleReport = (reason: string) => {
    if (reason === 'spam') {
      blockMutation.mutate(conversation.participant._id);
      setToastMessage(`You've blocked and reported ${conversation.participant.displayName} as spam.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
    setShowReportModal(false);
  };

  const handleDeleteConfirm = (reportSpam: boolean) => {
    deleteMutation.mutate(conversation._id, {
      onSuccess: () => onDeleted(),
    });
    setShowDeletePopover(false);
  };

  const currentUserId = getCurrentUserId();
  const isOtherTyping = typingUsers.has(conversation.participant._id);

  const filteredMessages = conversation.isBlocked
    ? messages.filter((m) => m.senderId !== conversation.participant._id)
    : messages;

  return (
    <div className={s.chatPanel} data-testid="conversation-view">
      {/* First-message safety banner */}
      {conversation.isFirstMessage && (
        <div className={s.firstMsgBanner} data-testid="first-message-banner">
          <p className={s.firstMsgTitle}>
            This is your first message from {conversation.participant.displayName}
          </p>
          <p className={s.firstMsgBody}>
            If anything feels uncomfortable, you can Block this user below, which
            will stop them from contacting or seeing you. You can also report this
            user, which will alert us to review their behaviour for violations.
          </p>
        </div>
      )}

      {/* Action bar */}
      <div className={s.chatActionBar} data-testid="chat-action-bar">
        <div className={s.chatActionLeft}>
          <span className={s.chatUserName}>
            {conversation.participant.displayName}
          </span>
          <button
            className={s.chatActionLink}
            onClick={handleBlock}
            data-testid="block-button"
          >
            {conversation.isBlocked ? 'Unblock' : 'Block'}
          </button>
          <button
            className={s.chatActionLink}
            onClick={() => setShowReportModal(true)}
            data-testid="report-button"
          >
            Report
          </button>
        </div>
        <div className={s.chatActionRight}>
          <button
            className={s.markUnreadBtn}
            data-testid="mark-unread-button"
          >
            Mark as unread
          </button>
          <div className={s.deleteBtnWrapper}>
            <button
              ref={deleteBtnRef}
              className={s.deleteBtn}
              onClick={() => setShowDeletePopover((prev) => !prev)}
              data-testid="delete-conversation-button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <DeleteConversationPopover
              open={showDeletePopover}
              onClose={() => setShowDeletePopover(false)}
              onConfirm={handleDeleteConfirm}
              anchorRef={deleteBtnRef}
            />
          </div>
        </div>
      </div>

      {/* Blocked banner */}
      {conversation.isBlocked && (
        <div className={s.blockedBanner} data-testid="blocked-banner">
          You have blocked {conversation.participant.displayName}. Their messages are hidden.
        </div>
      )}

      {/* Message thread */}
      <div className={s.messageThread} ref={threadRef} data-testid="message-thread">
        {isLoading ? (
          <div style={{ color: 'var(--sc-text-secondary)', textAlign: 'center', padding: 40 }}>
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ color: 'var(--sc-text-secondary)', textAlign: 'center', padding: 40 }}>
            No messages yet
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwnMessage={msg.senderId === currentUserId}
            />
          ))
        )}
        {/* Typing indicator */}
        {isOtherTyping && (
          <div className={s.typingIndicator} data-testid="typing-indicator">
            <span className={s.typingDot} />
            <span className={s.typingDot} />
            <span className={s.typingDot} />
            <span className={s.typingText}>
              {conversation.participant.displayName} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Composer */}
      {!conversation.isBlockedBy ? (
        <MessageComposer
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={sendMessageMutation.isPending}
        />
      ) : (
        <div className={s.blockedBanner}>
          You cannot send messages to this user.
        </div>
      )}

      {/* Block confirmation modal */}
      <BlockUserModal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockConfirm}
        displayName={conversation.participant.displayName}
      />

      {/* Report modal */}
      <ReportUserModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReport}
        displayName={conversation.participant.displayName}
      />

      {/* Report Toast */}
      {toastMessage && (
        <div className={s.reportToast} data-testid="report-spam-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

'use client';

import React from 'react';
import type { Conversation } from '../model/types';
import { formatRelativeTime, decodeEmojis } from './utils';
import s from './MessagesPage.module.scss';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
}) => {
  if (conversations.length === 0) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--sc-text-secondary, #999)',
          fontSize: 14,
        }}
      >
        No conversations yet
      </div>
    );
  }

  return (
    <div className={s.convList} data-testid="conversation-list">
      {conversations.map((conv) => (
        <button
          key={conv._id}
          className={`${s.convItem} ${activeId === conv._id ? s.convItemActive : ''}`}
          onClick={() => onSelect(conv._id)}
          data-testid={`conversation-item-${conv._id}`}
        >
          {/* Avatar with unread dot */}
          <div className={s.convAvatarWrapper}>
            {conv.unreadCount > 0 && (
              <div className={s.convUnreadDot} data-testid={`unread-dot-${conv._id}`} />
            )}
            <div className={s.convAvatar}>
              {conv.participant.avatarUrl ? (
                <img
                  src={conv.participant.avatarUrl}
                  alt={conv.participant.displayName}
                  className={s.convAvatarImg}
                />
              ) : (
                <span className={s.convAvatarInitial}>
                  {conv.participant.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className={s.convInfo}>
            <div className={s.convNameRow}>
              <span className={s.convName}>
                {conv.participant.displayName}
              </span>
              <span className={s.convTime}>
                {conv.lastMessage
                  ? formatRelativeTime(conv.lastMessage.createdAt)
                  : ''}
              </span>
            </div>
            <div className={s.convPreview}>
              {conv.lastMessage?.content ? decodeEmojis(conv.lastMessage.content) : ''}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

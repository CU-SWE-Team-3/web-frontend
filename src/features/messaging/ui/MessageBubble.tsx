'use client';

import React from 'react';
import type { Message, MessageStatus } from '../model/types';
import { TrackPreviewCard } from './TrackPreviewCard';
import { formatRelativeTime } from './utils';
import s from './MessagesPage.module.scss';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage?: boolean;
}

/** Renders the delivery status ticks for sent messages */
const StatusTicks: React.FC<{ status: MessageStatus }> = ({ status }) => {
  switch (status) {
    case 'sent':
      return <span className={s.msgStatusSent} data-testid="message-status-sent" title="Sent">✓</span>;
    case 'delivered':
      return <span className={s.msgStatusDelivered} data-testid="message-status-delivered" title="Delivered">✓✓</span>;
    case 'read':
      return <span className={s.msgStatusRead} data-testid="message-status-read" title="Read">✓✓</span>;
    default:
      return null;
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const senderName = message.sender?.displayName || 'Unknown';
  const senderAvatar = message.sender?.avatarUrl || null;

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={s.messageBubble} data-testid={`message-${message._id}`}>
        <div className={s.msgAvatar}>
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName} className={s.msgAvatarImg} />
          ) : null}
        </div>
        <div className={s.msgContent}>
          <div className={s.msgHeader}>
            <span className={s.msgSender} data-testid={`message-sender-${message._id}`}>{senderName}</span>
            <span className={s.msgTime} data-testid={`message-time-${message._id}`}>
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>
          <div className={s.msgText} data-testid={`message-content-${message._id}`} style={{ fontStyle: 'italic', opacity: 0.6 }}>
            This message was deleted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.messageBubble} data-testid={`message-${message._id}`}>
      <div className={s.msgAvatar} data-testid={`message-avatar-${message._id}`}>
        {senderAvatar ? (
          <img src={senderAvatar} alt={senderName} className={s.msgAvatarImg} />
        ) : null}
      </div>
      <div className={s.msgContent}>
        <div className={s.msgHeader}>
          <span className={s.msgSender} data-testid={`message-sender-${message._id}`}>{senderName}</span>
          <span className={s.msgTime} data-testid={`message-time-${message._id}`}>
            {formatRelativeTime(message.createdAt)}
          </span>
        </div>
        <div className={s.msgText} data-testid={`message-content-${message._id}`}>
          {message.content}
          {message.isEdited && (
            <span className={s.msgEdited} data-testid={`message-edited-${message._id}`}> (edited)</span>
          )}
        </div>
        {message.sharedTrack && (
          <TrackPreviewCard track={message.sharedTrack} />
        )}
        {/* Status ticks for own messages */}
        {isOwnMessage && message.status && (
          <div className={s.msgStatusRow} data-testid={`message-status-${message._id}`}>
            <StatusTicks status={message.status} />
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import type { Message, MessageStatus, MessageUser } from '../model/types';
import { TrackPreviewCard } from './TrackPreviewCard';
import { formatRelativeTime } from './utils';
import s from './MessagesPage.module.scss';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage?: boolean;
  /** All participants in the conversation — used to resolve sender info */
  participants?: MessageUser[];
  /** Current logged-in user info */
  currentUser?: { _id: string; displayName: string; avatarUrl: string | null } | null;
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

/** Resolves sender display name and avatar from props */
function resolveSender(
  message: Message,
  isOwnMessage: boolean,
  participants?: MessageUser[],
  currentUser?: { _id: string; displayName: string; avatarUrl: string | null } | null
): { name: string; avatar: string | null } {
  // Own messages → show "Me"
  if (isOwnMessage) {
    return {
      name: 'Me',
      avatar: currentUser?.avatarUrl || null,
    };
  }

  // Try resolving from message.sender first (populated by backend)
  if (message.sender?.displayName && message.sender.displayName !== 'Unknown') {
    return {
      name: message.sender.displayName,
      avatar: message.sender.avatarUrl || null,
    };
  }

  // Fallback: resolve from participants array
  if (participants) {
    const found = participants.find((p) => p._id === message.senderId);
    if (found) {
      return {
        name: found.displayName || 'Unknown',
        avatar: found.avatarUrl || null,
      };
    }
  }

  return { name: message.sender?.displayName || 'Unknown', avatar: message.sender?.avatarUrl || null };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage = false,
  participants,
  currentUser,
}) => {
  const { name: senderName, avatar: senderAvatar } = resolveSender(
    message, isOwnMessage, participants, currentUser
  );

  // Build a track preview if attachment exists
  const trackPreview = message.sharedTrack
    ? message.sharedTrack
    : message.attachment?.type === 'track'
      ? { trackId: message.attachment.referenceId, title: '', artist: '', artworkUrl: null, duration: 0, trackUrl: '' }
      : null;

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={s.messageBubble} data-testid={`message-${message._id}`}>
        <div className={s.msgAvatar}>
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName} className={s.msgAvatarImg} />
          ) : (
            <span className={s.msgAvatarInitial}>{senderName.charAt(0).toUpperCase()}</span>
          )}
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
        ) : (
          <span className={s.msgAvatarInitial}>{senderName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className={s.msgContent}>
        <div className={s.msgHeader}>
          <span className={s.msgSender} data-testid={`message-sender-${message._id}`}>{senderName}</span>
          <span className={s.msgTime} data-testid={`message-time-${message._id}`}>
            {formatRelativeTime(message.createdAt)}
          </span>
        </div>
        {message.content && (
          <div className={s.msgText} data-testid={`message-content-${message._id}`}>
            {message.content}
            {message.isEdited && (
              <span className={s.msgEdited} data-testid={`message-edited-${message._id}`}> (edited)</span>
            )}
          </div>
        )}
        {trackPreview && (
          <TrackPreviewCard track={trackPreview} />
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

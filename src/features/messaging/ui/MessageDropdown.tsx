'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { MessageIcon } from '@/shared/ui/icons';
import { useConversations } from '../model/useConversations';
import { useUnreadCount } from '../model/useUnreadCount';
import { formatRelativeTime } from './utils';
import s from './MessagesPage.module.scss';

interface MessageDropdownProps {
  /** Pass the NavBar's iconBtn class so the trigger matches other navbar icons */
  buttonClassName?: string;
}

export const MessageDropdown: React.FC<MessageDropdownProps> = ({
  buttonClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: conversations = [] } = useConversations();
  const { data: unreadCount = 0 } = useUnreadCount();

  // Show only the most recent conversations (up to 3)
  const recentConversations = conversations.slice(0, 3);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className={buttonClassName || s.msgIconBtn}
        onClick={toggle}
        data-testid="navbar-messages-button"
        style={{ position: 'relative' }}
      >
        <MessageIcon size={18} />
        {unreadCount > 0 && (
          <span className={s.navBadge} data-testid="unread-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={s.msgDropdown} data-testid="message-dropdown">
          <div className={s.msgDropdownHeader}>Messages</div>

          {recentConversations.length === 0 ? (
            <div className={s.msgDropdownEmpty}>No messages yet</div>
          ) : (
            recentConversations.map((conv) => (
              <Link
                key={conv._id}
                href={ROUTES.MESSAGES}
                className={s.msgDropdownItem}
                onClick={() => setIsOpen(false)}
                data-testid={`msg-dropdown-item-${conv._id}`}
              >
                {/* Avatar with unread dot */}
                <div className={s.msgDropdownAvatarWrapper}>
                  {conv.unreadCount > 0 && (
                    <div className={s.msgDropdownUnreadDot} data-testid={`dropdown-unread-dot-${conv._id}`} />
                  )}
                  <div className={s.msgDropdownAvatar}>
                    {conv.participant.avatarUrl ? (
                      <img src={conv.participant.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span className={s.msgDropdownAvatarInitial}>
                        {conv.participant.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className={s.msgDropdownInfo}>
                  <div className={s.msgDropdownName}>{conv.participant.displayName}</div>
                  <div className={s.msgDropdownPreview}>{conv.lastMessage?.content || ''}</div>
                </div>
                <div className={s.msgDropdownTime}>
                  {conv.lastMessage ? formatRelativeTime(conv.lastMessage.createdAt) : ''}
                </div>
              </Link>
            ))
          )}

          <Link
            href={ROUTES.MESSAGES}
            className={s.msgDropdownViewAll}
            onClick={() => setIsOpen(false)}
            data-testid="view-all-messages"
          >
            View all messages
          </Link>
        </div>
      )}
    </div>
  );
};

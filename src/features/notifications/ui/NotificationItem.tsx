'use client'

import { type FC, useCallback, useState } from 'react'
import type { Notification } from '@/shared/types'
import { useNotificationStore } from '../model/useNotificationStore'
import s from './NotificationDropdown.module.scss'

// ─── Helpers ────────────────────────────────────────────────────────────────────

function buildNotificationText(notification: Notification): string {
  const { actors, actorCount, type, contentSnippet } = notification
  const firstName = actors[0]?.displayName ?? 'Someone'
  const othersCount = actorCount - 1
  const actorLabel = othersCount > 0
    ? `${firstName} and ${othersCount} other${othersCount > 1 ? 's' : ''}`
    : firstName

  const actionMap: Record<string, string> = {
    LIKE:         `${actorLabel} liked your track`,
    REPOST:       `${actorLabel} reposted your track`,
    COMMENT:      `${actorLabel} commented: "${contentSnippet}"`,
    FOLLOW:       `${actorLabel} started following you`,
    MESSAGE:      `${actorLabel}: "${contentSnippet}"`,
    NEW_TRACK:    `${actorLabel} uploaded a new track`,
    NEW_PLAYLIST: `${actorLabel} created a new playlist`,
    MENTION:      `${actorLabel} mentioned you in a comment`,
    SYSTEM:       contentSnippet ?? 'System notification',
  }

  return actionMap[type] ?? 'You have a new notification'
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date

  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w`
  return new Date(dateString).toLocaleDateString()
}

// ─── Follow Button (inline, uses apiClient directly) ────────────────────────────

interface FollowBtnProps {
  userId: string
}

const FollowBtn: FC<FollowBtnProps> = ({ userId }) => {
  const [following, setFollowing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      const apiClient = (await import('@/shared/api/client')).default
      if (following) {
        await apiClient.delete(`/network/${userId}/follow`, { withCredentials: true })
        setFollowing(false)
      } else {
        await apiClient.post(`/network/${userId}/follow`, {}, { withCredentials: true })
        setFollowing(true)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const label = following ? (hovered ? 'Unfollow' : 'Following') : 'Follow back'

  return (
    <button
      className={`${s.followBtn} ${following ? s.followBtnFollowing : ''} ${following && hovered ? s.followBtnUnfollow : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      data-testid={`notification-follow-btn-${userId}`}
    >
      {label}
    </button>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export interface NotificationItemProps {
  notification: Notification
}

export const NotificationItem: FC<NotificationItemProps> = ({ notification }) => {
  const markRead = useNotificationStore((s) => s.markRead)

  const handleClick = useCallback(() => {
    if (!notification.isRead) {
      markRead(notification._id)
    }
  }, [notification._id, notification.isRead, markRead])

  const actor = notification.actors[0]
  const text = buildNotificationText(notification)
  const timeAgo = formatRelativeTime(notification.updatedAt)

  return (
    <div
      className={`${s.item} ${!notification.isRead ? s.itemUnread : ''}`}
      onClick={handleClick}
      data-testid={`notification-item-${notification._id}`}
      role="button"
      tabIndex={0}
    >
      {/* Unread dot */}
      {!notification.isRead && <div className={s.unreadDot} />}

      {/* Actor avatar */}
      <div className={s.avatar} data-testid={`notification-item-avatar-${notification._id}`}>
        {actor?.avatarUrl ? (
          <img src={actor.avatarUrl} alt={actor.displayName} className={s.avatarImg} />
        ) : (
          <div className={s.avatarPlaceholder}>
            {(actor?.displayName?.[0] ?? '?').toUpperCase()}
          </div>
        )}
      </div>

      {/* Text content */}
      <div className={s.body}>
        <div className={s.text} data-testid={`notification-item-text-${notification._id}`}>
          {text}
        </div>
        <div className={s.time}>{timeAgo}</div>
      </div>

      {/* Follow button for FOLLOW type, or artwork for other types */}
      {notification.type === 'FOLLOW' && actor ? (
        <FollowBtn userId={actor._id} />
      ) : notification.target?.artworkUrl ? (
        <div className={s.artwork}>
          <img
            src={notification.target.artworkUrl}
            alt={notification.target.title}
            className={s.artworkImg}
          />
        </div>
      ) : null}
    </div>
  )
}

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/shared/ui/NavBar/NavBar'
import { ROUTES } from '@/shared/constants/routes'
import { useNotificationStore } from '@/features/notifications/model/useNotificationStore'
import type { Notification, NotificationType } from '@/shared/types'
import apiClient from '@/shared/api/client'
import { BlockUserModal } from '@/features/messaging/ui/BlockUserModal'
import { ReportUserModal } from '@/features/messaging/ui/ReportUserModal'
import { useBlockStore } from '@/features/social-graph/model/useBlockStore'
import s from './page.module.scss'

// ─── Filter Types ───────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'LIKE' | 'REPOST' | 'FOLLOW' | 'COMMENT'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All notifications' },
  { key: 'LIKE', label: 'Likes' },
  { key: 'REPOST', label: 'Reposts' },
  { key: 'FOLLOW', label: 'Follows' },
  { key: 'COMMENT', label: 'Comments' },
]

// ─── Notification Text Builder ──────────────────────────────────────────────────
function buildNotificationText(notification: Notification): { actorName: string; action: string } {
  const { actors, actorCount, type, contentSnippet } = notification
  const firstName = actors[0]?.displayName ?? 'Someone'
  const othersCount = actorCount - 1
  const actorLabel = othersCount > 0
    ? `${firstName} and ${othersCount} other${othersCount > 1 ? 's' : ''}`
    : firstName

  const actionMap: Record<string, string> = {
    LIKE:         'liked your track',
    REPOST:       'reposted your track',
    COMMENT:      `commented: "${contentSnippet}"`,
    FOLLOW:       'started following you',
    MESSAGE:      `"${contentSnippet}"`,
    NEW_TRACK:    'uploaded a new track',
    NEW_PLAYLIST: 'created a new playlist',
    MENTION:      'mentioned you in a comment',
    SYSTEM:       contentSnippet ?? 'System notification',
  }

  return { actorName: actorLabel, action: actionMap[type] ?? 'sent a notification' }
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(dateString).toLocaleDateString()
}

import { useFollowStore } from '@/features/social-graph/model/useFollowStore'
import { useFollowing } from '@/features/social-graph/model/useFollowing'
import { useAuthStore } from '@/features/auth/model/useAuthStore'

// ─── Block Button Component ─────────────────────────────────────────────────────
function BlockButton({ userId, onUnblock }: { userId: string; onUnblock: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      await onUnblock()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`${s.followBtn} ${hovered ? s.followBtnUnfollow : s.followBtnFollowing}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      data-testid={`notif-page-blocked-btn-${userId}`}
    >
      {hovered ? 'Unblock' : 'Blocked'}
    </button>
  )
}

// ─── Follow Button Component ────────────────────────────────────────────────────
function FollowButton({ userId, initialFollowing = false, isBlocked = false, onUnblock }: { 
  userId: string; 
  initialFollowing?: boolean;
  isBlocked?: boolean;
  onUnblock: () => void;
}) {
  const followStore = useFollowStore()
  const authUser = useAuthStore(s => s.user)
  const myId = (authUser as any)?._id || authUser?.id
  const { data: followingList } = useFollowing(myId || '')
  
  const isActuallyFollowing = followingList?.some(u => u.id === userId || (u as any)._id === userId)
  const globalFollowing = followStore.followingMap[userId]
  const isFollowing = globalFollowing ?? isActuallyFollowing ?? initialFollowing

  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isBlocked) {
    return <BlockButton userId={userId} onUnblock={onUnblock} />
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      if (isFollowing) {
        await apiClient.delete(`/network/${userId}/follow`, { withCredentials: true })
        followStore.setFollowing(userId, false)
      } else {
        await apiClient.post(`/network/${userId}/follow`, {}, { withCredentials: true })
        followStore.setFollowing(userId, true)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const label = isFollowing ? (hovered ? 'Unfollow' : 'Following') : 'Follow back'
  const btnClass = isFollowing
    ? hovered ? s.followBtnUnfollow : s.followBtnFollowing
    : s.followBtnDefault

  return (
    <button
      className={`${s.followBtn} ${btnClass}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      data-testid={`notif-page-follow-btn-${userId}`}
    >
      {label}
    </button>
  )
}

// ─── Notification Row ───────────────────────────────────────────────────────────
function NotificationRow({ 
  notification, 
  onBlock, 
  onReport,
  onUnblock
}: { 
  notification: Notification;
  onBlock: (actor: any) => void;
  onReport: (actor: any) => void;
  onUnblock: (actor: any) => void;
}) {
  const { markRead, removeNotification } = useNotificationStore()
  const { blockedMap } = useBlockStore()
  const [moreOpen, setMoreOpen] = useState(false)

  const actor = notification.actors[0]
  const { actorName, action } = buildNotificationText(notification)
  const timeAgo = formatRelativeTime(notification.updatedAt)

  // Resolve profile link for the actor
  const actorHref = actor ? `/profile/${actor.permalink || actor._id}` : null

  // Resolve track/playlist target link
  const targetHref = notification.target?.permalink
    ? `/tracks/${notification.target.permalink}`
    : notification.actionLink || null

  const handleClick = () => {
    if (!notification.isRead) markRead(notification._id)
  }

  const showFollowBtn = actor && (notification.type === 'FOLLOW' || blockedMap[actor._id])

  return (
    <div
      className={`${s.notifRow} ${!notification.isRead ? s.notifRowUnread : ''}`}
      onClick={handleClick}
      data-testid={`notif-page-item-${notification._id}`}
    >
      {/* Avatar — clickable link to actor's profile */}
      {actorHref ? (
        <Link
          href={actorHref}
          onClick={(e) => e.stopPropagation()}
          className={s.notifAvatar}
          data-testid={`notif-page-avatar-${notification._id}`}
        >
          {actor?.avatarUrl ? (
            <img src={actor.avatarUrl} alt={actor.displayName} className={s.notifAvatarImg} />
          ) : (
            <div className={s.notifAvatarPlaceholder}>
              {(actor?.displayName?.[0] ?? '?').toUpperCase()}
            </div>
          )}
        </Link>
      ) : (
        <div className={s.notifAvatar}>
          <div className={s.notifAvatarPlaceholder}>?</div>
        </div>
      )}

      {/* Body — actor name is a clickable link */}
      <div className={s.notifBody}>
        <div className={s.notifText}>
          {actorHref ? (
            <Link
              href={actorHref}
              onClick={(e) => e.stopPropagation()}
              className={s.actorLink}
              data-testid={`notif-page-actor-link-${notification._id}`}
            >
              {actorName}
            </Link>
          ) : (
            <strong>{actorName}</strong>
          )}{' '}{action}
        </div>
        <div className={s.notifTime}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {timeAgo}
        </div>
      </div>

      {/* Actions */}
      <div className={s.notifActions}>
        {/* Follow button for social notifications */}
        {showFollowBtn && (
          <FollowButton 
            userId={actor._id} 
            initialFollowing={actor.isFollowing} 
            isBlocked={blockedMap[actor._id]}
            onUnblock={() => onUnblock(actor)}
          />
        )}

        {/* Track artwork thumbnail — clickable link */}
        {!showFollowBtn && notification.target?.artworkUrl && (
          targetHref ? (
            <Link
              href={targetHref}
              onClick={(e) => e.stopPropagation()}
              className={s.notifArtwork}
              data-testid={`notif-page-artwork-${notification._id}`}
            >
              <img src={notification.target.artworkUrl} alt={notification.target.title} className={s.notifArtworkImg} />
            </Link>
          ) : (
            <div className={s.notifArtwork}>
              <img src={notification.target.artworkUrl} alt={notification.target.title} className={s.notifArtworkImg} />
            </div>
          )
        )}

        {/* More options */}
        <div style={{ position: 'relative' }}>
          <button
            className={s.notifMoreBtn}
            onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen) }}
            data-testid={`notif-page-more-${notification._id}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 4" fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="14" cy="2" r="1.5"/></svg>
          </button>
          {moreOpen && (
            <div className={s.notifMoreDropdown}>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (actor) {
                    if (blockedMap[actor._id]) {
                      onUnblock(actor);
                    } else {
                      onBlock(actor);
                    }
                  }
                  setMoreOpen(false) 
                }}
              >
                {actor && blockedMap[actor._id] ? 'Unblock' : 'Block'} {actor?.displayName}
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (actor) onReport(actor);
                  setMoreOpen(false) 
                }}
              >
                Report {actor?.displayName}
              </button>
              <div className={s.dropdownDivider} />
              <button
                onClick={(e) => { e.stopPropagation(); removeNotification(notification._id); setMoreOpen(false) }}
                data-testid={`notif-page-delete-${notification._id}`}
              >
                Delete notification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAllRead,
    fetchUnreadCount,
    unreadCount,
  } = useNotificationStore()

  const { blockedMap, setBlocked } = useBlockStore()

  const [filter, setFilter] = useState<FilterKey>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedActor, setSelectedActor] = useState<any>(null)
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleBlockConfirm = async () => {
    if (!selectedActor) return
    try {
      await apiClient.post(`/network/${selectedActor._id}/block`, {}, { withCredentials: true })
      setBlocked(selectedActor._id, true)
      setBlockModalOpen(false)
    } catch {
      alert('Error blocking user')
    }
  }

  const handleUnblock = async (actor: any) => {
    try {
      await apiClient.delete(`/network/${actor._id}/block`, { withCredentials: true })
      setBlocked(actor._id, false)
    } catch {
      alert('Error unblocking user')
    }
  }

  const handleReportConfirm = (reason: string) => {
    // API call would go here
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
    setReportModalOpen(false)
  }

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications(1)
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // Client-side filter
  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter)

  // Extract recent followers from FOLLOW notifications
  const recentFollowers = notifications
    .filter((n) => n.type === 'FOLLOW')
    .slice(0, 5)
    .map((n) => n.actors[0])
    .filter(Boolean)

  const activeFilter = FILTERS.find((f) => f.key === filter)

  return (
    <div className={s.page} data-testid="notifications-page">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      {/* Announcement banner */}
      <div className={s.banner}>
        <span style={{ fontSize: 16 }}>🎵</span>
        <span style={{ flex: 1 }}>
          Now available: Get heard by up to 100 listeners on your next upload with Artist or Artist Pro.{' '}
          <span className={s.bannerLink}>Learn More</span>
        </span>
        <button className={s.bannerClose} data-testid="notif-banner-close">×</button>
      </div>

      <div className={s.content}>
        {/* ── Main Column ── */}
        <div className={s.mainCol}>
          {/* Header */}
          <div className={s.headerRow}>
            <h1 className={s.pageTitle} data-testid="notifications-page-title">Notifications</h1>

            {/* Filter Dropdown */}
            <div className={s.filterWrapper}>
              <button
                className={s.filterBtn}
                onClick={() => setFilterOpen(!filterOpen)}
                data-testid="notifications-filter-button"
              >
                {activeFilter?.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {filterOpen && (
                <div className={s.filterDropdown} data-testid="notifications-filter-dropdown">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      className={`${s.filterOption} ${f.key === filter ? s.filterOptionActive : ''}`}
                      onClick={() => { setFilter(f.key); setFilterOpen(false) }}
                      data-testid={`notifications-filter-${f.key}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className={s.notifList} data-testid="notifications-list">
            {isLoading && filtered.length === 0 ? (
              <div className={s.emptyState}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div className={s.emptyState} data-testid="notifications-empty">
                No notifications
              </div>
            ) : (
              filtered.map((n, idx) => (
                <NotificationRow 
                  key={`${n._id}-${idx}`} 
                  notification={n} 
                  onBlock={(actor) => { setSelectedActor(actor); setBlockModalOpen(true); }}
                  onReport={(actor) => { setSelectedActor(actor); setReportModalOpen(true); }}
                  onUnblock={handleUnblock}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={s.sidebar}>
          {/* Recent Followers */}
          {recentFollowers.length > 0 && (
            <div className={s.sidebarSection}>
              <div className={s.sidebarHeader}>
                <span className={s.sidebarTitle}>RECENT FOLLOWERS</span>
                <Link href="#" className={s.sidebarViewAll}>View all</Link>
              </div>
              {recentFollowers.map((actor) => actor && (
                <div key={actor._id} className={s.sidebarUser}>
                  <div className={s.sidebarUserAvatar}>
                    {actor.avatarUrl ? (
                      <img src={actor.avatarUrl} alt={actor.displayName} />
                    ) : (
                      <div className={s.sidebarUserAvatarPlaceholder}>
                        {actor.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className={s.sidebarUserName}>{actor.displayName}</span>
                  <FollowButton 
                    userId={actor._id} 
                    initialFollowing={actor.isFollowing} 
                    isBlocked={blockedMap[actor._id]}
                    onUnblock={() => handleUnblock(actor)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Footer Links */}
          <div className={s.footerLinks}>
            <Link href="#">Legal</Link> · <Link href="#">Privacy</Link> · <Link href="#">Cookie Policy</Link> · <Link href="#">Cookie Manager</Link> · <Link href="#">Imprint</Link> · <Link href="#">Artist Resources</Link> · <Link href="#">Newsroom</Link> · <Link href="#">Charts</Link> · <Link href="#">Transparency Reports</Link>
          </div>
          <div className={s.footerLang}>
            Language: <span className={s.langLink}>English (US)</span>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <BlockUserModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleBlockConfirm}
        displayName={selectedActor?.displayName || ''}
      />

      <ReportUserModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReport={handleReportConfirm}
        displayName={selectedActor?.displayName || ''}
      />

      {/* Toast */}
      {showToast && (
        <div className={s.reportToast} data-testid="report-success-toast">
          Thank you for your report. Our team will review this account as soon as possible.
        </div>
      )}
    </div>
  )
}

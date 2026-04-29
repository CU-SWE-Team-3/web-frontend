'use client'

import { type FC, useEffect, useRef, useCallback, useState } from 'react'
import Link from 'next/link'
import { useNotificationStore } from '../model/useNotificationStore'
import { NotificationItem } from './NotificationItem'
import s from './NotificationDropdown.module.scss'

export interface NotificationDropdownProps {
  className?: string
}

export const NotificationDropdown: FC<NotificationDropdownProps> = ({ className }) => {
  const {
    notifications,
    isLoading,
    isDropdownOpen,
    unreadCount,
    setDropdownOpen,
    fetchNotifications,
    markAllRead,
  } = useNotificationStore()

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchNotifications(1)
    }
  }, [isDropdownOpen, fetchNotifications])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen, setDropdownOpen])

  const handleSettingsClick = useCallback(() => {
    setDropdownOpen(false)
  }, [setDropdownOpen])

  if (!isDropdownOpen) return null

  return (
    <div
      ref={dropdownRef}
      className={[s.dropdown, className].filter(Boolean).join(' ')}
      data-testid="notification-dropdown"
    >
      {/* ── Header ── */}
      <div className={s.header} data-testid="notification-dropdown-header">
        <span className={s.title}>Notifications</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {unreadCount > 0 && (
            <button
              className={s.markAllRead}
              onClick={() => markAllRead()}
              data-testid="notification-mark-all-read"
            >
              Mark all read
            </button>
          )}
          <Link
            href="/settings?tab=notifications"
            className={s.settingsLink}
            onClick={handleSettingsClick}
            data-testid="notification-dropdown-settings-link"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className={s.list} data-testid="notification-dropdown-list">
        {isLoading && notifications.length === 0 ? (
          <div className={s.empty}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div className={s.empty} data-testid="notification-dropdown-empty">
            No notifications
          </div>
        ) : (
          notifications.map((notification, idx) => (
            <NotificationItem
              key={`${notification._id}-${idx}`}
              notification={notification}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className={s.footer}>
        <Link
          href="/notifications"
          className={s.viewAll}
          onClick={handleSettingsClick}
          data-testid="notification-dropdown-view-all"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}

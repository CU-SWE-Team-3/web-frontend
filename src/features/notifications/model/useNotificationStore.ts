'use client'

import { create } from 'zustand'
import type { Notification } from '@/shared/types'
import {
  fetchNotifications as apiFetchNotifications,
  fetchUnreadCount as apiFetchUnreadCount,
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
  deleteNotification as apiDeleteNotification,
} from '../api/notificationApi'

// ─── Notification Store ─────────────────────────────────────────────────────────

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isDropdownOpen: boolean
  currentPage: number
  totalPages: number

  // Actions
  fetchNotifications: (page?: number) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  addNotification: (notification: Notification) => void
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  setDropdownOpen: (open: boolean) => void

  // Socket handlers (no API call — just store update)
  handleSocketNewNotification: (notification: Notification) => void
  handleSocketNotificationRead: (id: string) => void
  handleSocketAllNotificationsRead: () => void
  handleSocketNotificationDeleted: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isDropdownOpen: false,
  currentPage: 1,
  totalPages: 1,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true })
    try {
      const response = await apiFetchNotifications(page, 20)
      if (page === 1) {
        set({
          notifications: response.notifications,
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
        })
      } else {
        const existing = get().notifications
        const existingIds = new Set(existing.map(n => n._id))
        const newOnes = response.notifications.filter(n => !existingIds.has(n._id))
        set({
          notifications: [...existing, ...newOnes],
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
        })
      }
    } catch (err) {
      console.error('[Notifications] Failed to fetch:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await apiFetchUnreadCount()
      set({ unreadCount: count })
    } catch (err) {
      console.error('[Notifications] Failed to fetch unread count:', err)
    }
  },

  addNotification: (notification) => {
    const existing = get().notifications
    
    // Allow multiple notifications even if the backend reuses the same ID (e.g. for comments on the same track).
    set({
      notifications: [notification, ...existing],
      unreadCount: !notification.isRead ? get().unreadCount + 1 : get().unreadCount,
    })
  },

  markRead: async (id) => {
    try {
      await apiMarkRead(id)
      const notifications = get().notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      )
      const wasUnread = get().notifications.find(n => n._id === id)?.isRead === false
      set({
        notifications,
        unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
      })
    } catch (err) {
      console.error('[Notifications] Failed to mark read:', err)
    }
  },

  markAllRead: async () => {
    try {
      await apiMarkAllRead()
      set({
        notifications: get().notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      })
    } catch (err) {
      console.error('[Notifications] Failed to mark all read:', err)
    }
  },

  removeNotification: async (id) => {
    try {
      await apiDeleteNotification(id)
      const target = get().notifications.find(n => n._id === id)
      set({
        notifications: get().notifications.filter(n => n._id !== id),
        unreadCount: target && !target.isRead
          ? Math.max(0, get().unreadCount - 1)
          : get().unreadCount,
      })
    } catch (err) {
      console.error('[Notifications] Failed to delete:', err)
    }
  },

  setDropdownOpen: (open) => set({ isDropdownOpen: open }),

  // ── Socket-only handlers (update store without API call) ──────────────────
  handleSocketNewNotification: (notification) => {
    get().addNotification(notification)
  },

  handleSocketNotificationRead: (id) => {
    const notifications = get().notifications.map(n =>
      n._id === id ? { ...n, isRead: true } : n
    )
    const wasUnread = get().notifications.find(n => n._id === id)?.isRead === false
    set({
      notifications,
      unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
    })
  },

  handleSocketAllNotificationsRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    })
  },

  handleSocketNotificationDeleted: (id) => {
    const target = get().notifications.find(n => n._id === id)
    set({
      notifications: get().notifications.filter(n => n._id !== id),
      unreadCount: target && !target.isRead
        ? Math.max(0, get().unreadCount - 1)
        : get().unreadCount,
    })
  },
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotificationStore } from '../useNotificationStore'
import type { Notification } from '@/shared/types'

// Mock the API module
vi.mock('../../api/notificationApi', () => ({
  fetchNotifications: vi.fn(),
  fetchUnreadCount: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

const mockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  _id: 'n1',
  recipient: 'user1',
  actors: [{ _id: 'actor1', displayName: 'Fan One', avatarUrl: null }],
  actorCount: 1,
  type: 'LIKE',
  target: { _id: 't1', title: 'Track One', permalink: 'track-one', artworkUrl: null },
  targetModel: 'Track',
  contentSnippet: null,
  isRead: false,
  actionLink: null,
  createdAt: '2026-04-20T18:00:00.000Z',
  updatedAt: '2026-04-20T18:00:00.000Z',
  ...overrides,
})

describe('useNotificationStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isDropdownOpen: false,
      currentPage: 1,
      totalPages: 1,
    })
    vi.clearAllMocks()
  })

  // ── addNotification ─────────────────────────────────────────────────────────
  describe('addNotification', () => {
    it('should prepend a new notification and increment unread count', () => {
      const n = mockNotification()
      useNotificationStore.getState().addNotification(n)

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]._id).toBe('n1')
      expect(state.unreadCount).toBe(1)
    })

    it('should update existing notification and bring it to top', () => {
      const n1 = mockNotification({ _id: 'n1', isRead: true })
      const n2 = mockNotification({ _id: 'n2' })
      useNotificationStore.getState().addNotification(n1)
      useNotificationStore.getState().addNotification(n2)
      
      expect(useNotificationStore.getState().notifications).toHaveLength(2)
      expect(useNotificationStore.getState().unreadCount).toBe(1) // n2 is unread, n1 is read

      // Update n1 to be unread and with more actors
      const updatedN1 = mockNotification({ _id: 'n1', isRead: false, actorCount: 2 })
      useNotificationStore.getState().addNotification(updatedN1)

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(2)
      // n1 should now be at the top
      expect(state.notifications[0]._id).toBe('n1')
      expect(state.notifications[0].actorCount).toBe(2)
      // unread count should be 2 because n1 went from read to unread
      expect(state.unreadCount).toBe(2)
    })
  })

  // ── setDropdownOpen ─────────────────────────────────────────────────────────
  describe('setDropdownOpen', () => {
    it('should toggle dropdown state', () => {
      useNotificationStore.getState().setDropdownOpen(true)
      expect(useNotificationStore.getState().isDropdownOpen).toBe(true)

      useNotificationStore.getState().setDropdownOpen(false)
      expect(useNotificationStore.getState().isDropdownOpen).toBe(false)
    })
  })

  // ── handleSocketNewNotification ─────────────────────────────────────────────
  describe('handleSocketNewNotification', () => {
    it('should add the notification via socket handler', () => {
      const n = mockNotification({ _id: 'socket-n1' })
      useNotificationStore.getState().handleSocketNewNotification(n)

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]._id).toBe('socket-n1')
      expect(state.unreadCount).toBe(1)
    })
  })

  // ── handleSocketNotificationRead ────────────────────────────────────────────
  describe('handleSocketNotificationRead', () => {
    it('should mark a notification as read and decrement unread count', () => {
      const n = mockNotification({ _id: 'n1', isRead: false })
      useNotificationStore.setState({ notifications: [n], unreadCount: 1 })

      useNotificationStore.getState().handleSocketNotificationRead('n1')

      const state = useNotificationStore.getState()
      expect(state.notifications[0].isRead).toBe(true)
      expect(state.unreadCount).toBe(0)
    })

    it('should not decrement unread count for already-read notifications', () => {
      const n = mockNotification({ _id: 'n1', isRead: true })
      useNotificationStore.setState({ notifications: [n], unreadCount: 0 })

      useNotificationStore.getState().handleSocketNotificationRead('n1')
      expect(useNotificationStore.getState().unreadCount).toBe(0)
    })
  })

  // ── handleSocketAllNotificationsRead ────────────────────────────────────────
  describe('handleSocketAllNotificationsRead', () => {
    it('should mark all notifications as read and reset badge', () => {
      const notifications = [
        mockNotification({ _id: 'n1', isRead: false }),
        mockNotification({ _id: 'n2', isRead: false }),
        mockNotification({ _id: 'n3', isRead: true }),
      ]
      useNotificationStore.setState({ notifications, unreadCount: 2 })

      useNotificationStore.getState().handleSocketAllNotificationsRead()

      const state = useNotificationStore.getState()
      expect(state.notifications.every(n => n.isRead)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  // ── handleSocketNotificationDeleted ─────────────────────────────────────────
  describe('handleSocketNotificationDeleted', () => {
    it('should remove the notification from the list', () => {
      const notifications = [
        mockNotification({ _id: 'n1' }),
        mockNotification({ _id: 'n2' }),
      ]
      useNotificationStore.setState({ notifications, unreadCount: 2 })

      useNotificationStore.getState().handleSocketNotificationDeleted('n1')

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]._id).toBe('n2')
      expect(state.unreadCount).toBe(1)
    })

    it('should not decrement unread for already-read deleted notifications', () => {
      const n = mockNotification({ _id: 'n1', isRead: true })
      useNotificationStore.setState({ notifications: [n], unreadCount: 0 })

      useNotificationStore.getState().handleSocketNotificationDeleted('n1')

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(0)
      expect(state.unreadCount).toBe(0)
    })
  })
})

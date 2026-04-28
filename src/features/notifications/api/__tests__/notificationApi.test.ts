import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  updateNotificationPreferences,
  registerFcmToken,
  unregisterFcmToken,
} from '../notificationApi'
import apiClient from '@/shared/api/client'

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('notificationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── GET /notifications ──────────────────────────────────────────────────────
  describe('fetchNotifications', () => {
    it('should call GET /notifications with page and limit params', async () => {
      const mockResponse = {
        data: {
          data: {
            notifications: [
              { _id: 'n1', type: 'LIKE', isRead: false, actorCount: 1, actors: [] },
            ],
            pagination: { total: 1, page: 1, totalPages: 1 },
          },
        },
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await fetchNotifications(1, 20)
      expect(apiClient.get).toHaveBeenCalledWith('/notifications', {
        params: { page: 1, limit: 20 },
        withCredentials: true,
      })
      expect(result.notifications).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
    })

    it('should return empty feed if data is null', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: null } })

      const result = await fetchNotifications()
      expect(result.notifications).toEqual([])
      expect(result.pagination.total).toBe(0)
    })
  })

  // ── GET /notifications/unread-count ─────────────────────────────────────────
  describe('fetchUnreadCount', () => {
    it('should return the unread count', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: { unreadCount: 7 } },
      })

      const count = await fetchUnreadCount()
      expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count', {
        withCredentials: true,
      })
      expect(count).toBe(7)
    })

    it('should return 0 if data is missing', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: null } })
      const count = await fetchUnreadCount()
      expect(count).toBe(0)
    })
  })

  // ── PATCH /notifications/{id}/read ──────────────────────────────────────────
  describe('markNotificationRead', () => {
    it('should call PATCH with the correct notification ID', async () => {
      const mockNotification = { _id: 'n1', type: 'LIKE', isRead: true }
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { data: { notification: mockNotification } },
      })

      const result = await markNotificationRead('n1')
      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/n1/read', {}, {
        withCredentials: true,
      })
      expect(result.isRead).toBe(true)
    })
  })

  // ── PATCH /notifications/mark-read ──────────────────────────────────────────
  describe('markAllNotificationsRead', () => {
    it('should call PATCH /notifications/mark-read and return modifiedCount', async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { data: { modifiedCount: 12 } },
      })

      const count = await markAllNotificationsRead()
      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/mark-read', {}, {
        withCredentials: true,
      })
      expect(count).toBe(12)
    })
  })

  // ── DELETE /notifications/{id} ──────────────────────────────────────────────
  describe('deleteNotification', () => {
    it('should call DELETE with the correct notification ID', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } })

      await deleteNotification('n1')
      expect(apiClient.delete).toHaveBeenCalledWith('/notifications/n1', {
        withCredentials: true,
      })
    })
  })

  // ── PATCH /notifications/preferences ────────────────────────────────────────
  describe('updateNotificationPreferences', () => {
    it('should send partial preferences and return the full prefs', async () => {
      const prefs = { pushEnabled: true, allowLikes: true, allowReposts: false }
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: {
          data: {
            pushEnabled: true,
            allowLikes: true,
            allowReposts: false,
            allowComments: true,
            allowFollows: true,
            allowMessages: true,
            allowNewTracks: true,
          },
        },
      })

      const result = await updateNotificationPreferences(prefs)
      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/preferences', prefs, {
        withCredentials: true,
      })
      expect(result.allowReposts).toBe(false)
    })
  })

  // ── POST /notifications/fcm-token ──────────────────────────────────────────
  describe('registerFcmToken', () => {
    it('should call POST with the FCM token', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true } })

      await registerFcmToken('fcm-token-abc')
      expect(apiClient.post).toHaveBeenCalledWith(
        '/notifications/fcm-token',
        { token: 'fcm-token-abc' },
        { withCredentials: true }
      )
    })
  })

  // ── DELETE /notifications/fcm-token ─────────────────────────────────────────
  describe('unregisterFcmToken', () => {
    it('should call DELETE with the FCM token in body', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } })

      await unregisterFcmToken('fcm-token-abc')
      expect(apiClient.delete).toHaveBeenCalledWith('/notifications/fcm-token', {
        data: { token: 'fcm-token-abc' },
        withCredentials: true,
      })
    })
  })
})

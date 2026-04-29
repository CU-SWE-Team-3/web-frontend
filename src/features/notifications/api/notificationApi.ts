import apiClient from '@/shared/api/client'
import type { Notification, NotificationFeedResponse, NotificationPreferences } from '@/shared/types'

// ─── Notification API ──────────────────────────────────────────────────────────
// REST endpoints from YAML spec (lines 8929–9358)

/**
 * GET /notifications — paginated notification feed
 * YAML: 200 → { success, data: { notifications: [...], pagination } }
 */
export const fetchNotifications = async (page = 1, limit = 20): Promise<NotificationFeedResponse> => {
  const { data } = await apiClient.get('/notifications', {
    params: { page, limit },
    withCredentials: true,
  })
  return data.data ?? { notifications: [], pagination: { total: 0, page: 1, totalPages: 0 } }
}

/**
 * GET /notifications/unread-count — badge count
 * YAML: 200 → { success, data: { unreadCount: number } }
 */
export const fetchUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get('/notifications/unread-count', {
    withCredentials: true,
  })
  return data.data?.unreadCount ?? 0
}

/**
 * PATCH /notifications/{id}/read — mark single notification as read
 * YAML: 200 → { success, data: { notification: Notification } }
 */
export const markNotificationRead = async (id: string): Promise<Notification> => {
  const { data } = await apiClient.patch(`/notifications/${id}/read`, {}, {
    withCredentials: true,
  })
  return data.data?.notification ?? data.data
}

/**
 * PATCH /notifications/mark-read — mark all notifications as read
 * YAML: 200 → { success, message, data: { modifiedCount } }
 */
export const markAllNotificationsRead = async (): Promise<number> => {
  const { data } = await apiClient.patch('/notifications/mark-read', {}, {
    withCredentials: true,
  })
  return data.data?.modifiedCount ?? 0
}

/**
 * DELETE /notifications/{id} — delete a single notification
 * YAML: 200 → { success, message }
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`, {
    withCredentials: true,
  })
}

/**
 * GET /notifications/preferences — fetch push notification preferences
 */
export const fetchNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const { data } = await apiClient.get('/notifications/preferences', {
    withCredentials: true,
  })
  return data.data
}

/**
 * PATCH /notifications/preferences — update push notification preferences
 * YAML: 200 → { success, data: NotificationPreferences }
 */
export const updateNotificationPreferences = async (
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const { data } = await apiClient.patch('/notifications/preferences', prefs, {
    withCredentials: true,
  })
  return data.data
}

/**
 * POST /notifications/fcm-token — register FCM device token
 * YAML: 200 → { success, message }
 */
export const registerFcmToken = async (token: string): Promise<void> => {
  await apiClient.post('/notifications/fcm-token', { token }, {
    withCredentials: true,
  })
}

/**
 * DELETE /notifications/fcm-token — unregister FCM device token
 * YAML: 200 → { success, message }
 */
export const unregisterFcmToken = async (token: string): Promise<void> => {
  await apiClient.delete('/notifications/fcm-token', {
    data: { token },
    withCredentials: true,
  })
}

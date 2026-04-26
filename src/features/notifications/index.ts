// ─── Public API for the notifications feature ────────────────────────────────
// Other parts of the app should only import from this file.

export { useNotificationStore } from './model/useNotificationStore'
export { useNotificationPreferencesStore } from './model/useNotificationPreferencesStore'
export type { NotificationSettingsState } from './model/useNotificationPreferencesStore'
export { NotificationDropdown } from './ui/NotificationDropdown'
export { NotificationSettingsTab } from './ui/NotificationSettingsTab'
export {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  updateNotificationPreferences,
  registerFcmToken,
  unregisterFcmToken,
} from './api/notificationApi'

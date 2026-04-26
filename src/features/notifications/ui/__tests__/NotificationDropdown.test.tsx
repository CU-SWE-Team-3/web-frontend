import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { NotificationDropdown } from '../NotificationDropdown'
import { useNotificationStore } from '../../model/useNotificationStore'
import type { Notification } from '@/shared/types'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock the API to prevent real calls
vi.mock('../../api/notificationApi', () => ({
  fetchNotifications: vi.fn().mockResolvedValue({
    notifications: [],
    pagination: { total: 0, page: 1, totalPages: 0 },
  }),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

const mockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  _id: 'test-n1',
  recipient: 'user1',
  actors: [{ _id: 'actor1', displayName: 'John Doe', avatarUrl: 'https://example.com/avatar.jpg' }],
  actorCount: 1,
  type: 'LIKE',
  target: { _id: 't1', title: 'My Track', permalink: 'my-track', artworkUrl: null },
  targetModel: 'Track',
  contentSnippet: null,
  isRead: false,
  actionLink: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

describe('NotificationDropdown', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isDropdownOpen: true, // Open by default for tests
      currentPage: 1,
      totalPages: 1,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the dropdown when open', () => {
    render(<NotificationDropdown />)
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument()
  })

  it('should not render when dropdown is closed', () => {
    useNotificationStore.setState({ isDropdownOpen: false })
    render(<NotificationDropdown />)
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument()
  })

  it('should show "No notifications" when list is empty', async () => {
    render(<NotificationDropdown />)
    await waitFor(() => {
      expect(screen.getByTestId('notification-dropdown-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('should render the header with title and settings link', () => {
    render(<NotificationDropdown />)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByTestId('notification-dropdown-settings-link')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should render notification items when notifications exist', () => {
    const notifications = [
      mockNotification({ _id: 'n1' }),
      mockNotification({ _id: 'n2', type: 'FOLLOW', actors: [{ _id: 'a2', displayName: 'Jane', avatarUrl: null }] }),
    ]
    useNotificationStore.setState({ notifications, isDropdownOpen: true })

    render(<NotificationDropdown />)
    expect(screen.getByTestId('notification-item-n1')).toBeInTheDocument()
    expect(screen.getByTestId('notification-item-n2')).toBeInTheDocument()
  })

  it('should render Settings link pointing to /settings?tab=notifications', () => {
    render(<NotificationDropdown />)
    const link = screen.getByTestId('notification-dropdown-settings-link')
    expect(link).toHaveAttribute('href', '/settings?tab=notifications')
  })

  it('should show "View all notifications" footer when notifications exist', () => {
    useNotificationStore.setState({
      notifications: [mockNotification()],
      isDropdownOpen: true,
    })
    render(<NotificationDropdown />)
    expect(screen.getByTestId('notification-dropdown-view-all')).toBeInTheDocument()
  })

  it('should show "Mark all read" button when there are unread notifications', () => {
    useNotificationStore.setState({
      notifications: [mockNotification()],
      unreadCount: 1,
      isDropdownOpen: true,
    })
    render(<NotificationDropdown />)
    expect(screen.getByTestId('notification-mark-all-read')).toBeInTheDocument()
  })

  it('should display notification text for LIKE type', () => {
    useNotificationStore.setState({
      notifications: [mockNotification({ _id: 'n1', type: 'LIKE' })],
      isDropdownOpen: true,
    })
    render(<NotificationDropdown />)
    expect(screen.getByText('John Doe liked your track')).toBeInTheDocument()
  })

  it('should display grouped notification text with multiple actors', () => {
    useNotificationStore.setState({
      notifications: [
        mockNotification({
          _id: 'n1',
          type: 'LIKE',
          actorCount: 3,
          actors: [{ _id: 'a1', displayName: 'Fan One', avatarUrl: null }],
        }),
      ],
      isDropdownOpen: true,
    })
    render(<NotificationDropdown />)
    expect(screen.getByText('Fan One and 2 others liked your track')).toBeInTheDocument()
  })
})

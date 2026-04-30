import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NotificationsPage from '../page'
import { useNotificationStore } from '@/features/notifications/model/useNotificationStore'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import type { Notification } from '@/shared/types'

// Mock next modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/notifications',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock NavBar
vi.mock('@/shared/ui/NavBar/NavBar', () => ({
  NavBar: () => <nav data-testid="mock-navbar" />,
}))

// Mock notification API
vi.mock('@/features/notifications/api/notificationApi', () => ({
  fetchNotifications: vi.fn().mockResolvedValue({
    notifications: [],
    pagination: { total: 0, page: 1, totalPages: 0 },
  }),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

// Mock apiClient for follow
vi.mock('@/shared/api/client', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

// Mock hooks to avoid QueryClient requirement where possible
vi.mock('@/features/social-graph/model/useFollowing', () => ({
  useFollowing: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}))

vi.mock('@/features/social-graph/model/useBlockedUsers', () => ({
  useBlockedUsers: vi.fn().mockReturnValue({ data: [] }),
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

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

describe('NotificationsPage', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isDropdownOpen: false,
      currentPage: 1,
      totalPages: 1,
      fetchNotifications: vi.fn(),
      fetchUnreadCount: vi.fn(),
    })

    useAuthStore.setState({
      user: { id: 'user1', email: 'test@test.com', username: 'testuser', displayName: 'Test', role: 'listener', isVerified: false, createdAt: '' } as any,
      isAuthenticated: true,
      isInitialized: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the notifications page', () => {
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByTestId('notifications-page')).toBeInTheDocument()
  })

  it('renders the page title "Notifications"', () => {
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByTestId('notifications-page-title')).toHaveTextContent('Notifications')
  })

  it('renders the filter button', () => {
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByTestId('notifications-filter-button')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-filter-button')).toHaveTextContent('All notifications')
  })

  it('opens filter dropdown on click', async () => {
    const user = userEvent.setup()
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    await user.click(screen.getByTestId('notifications-filter-button'))
    expect(screen.getByTestId('notifications-filter-dropdown')).toBeInTheDocument()
  })

  it('shows all filter options in dropdown', async () => {
    const user = userEvent.setup()
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    await user.click(screen.getByTestId('notifications-filter-button'))

    expect(screen.getByTestId('notifications-filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-filter-LIKE')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-filter-REPOST')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-filter-FOLLOW')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-filter-COMMENT')).toBeInTheDocument()
  })

  it('shows "No notifications" when list is empty', () => {
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByTestId('notifications-empty')).toBeInTheDocument()
  })

  it('renders notification items when notifications exist', () => {
    useNotificationStore.setState({
      notifications: [
        mockNotification({ _id: 'n1', type: 'LIKE' }),
        mockNotification({ _id: 'n2', type: 'FOLLOW', actors: [{ _id: 'a2', displayName: 'Jane', avatarUrl: null }] }),
      ],
    })
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByTestId('notif-page-item-n1')).toBeInTheDocument()
    expect(screen.getByTestId('notif-page-item-n2')).toBeInTheDocument()
  })

  it('filters notifications by type', async () => {
    const user = userEvent.setup()
    const testNotifs = [
      mockNotification({ _id: 'n1', type: 'LIKE' }),
      mockNotification({ _id: 'n2', type: 'FOLLOW', actors: [{ _id: 'a2', displayName: 'Jane', avatarUrl: null }] }),
      mockNotification({ _id: 'n3', type: 'COMMENT', contentSnippet: 'Nice!', actors: [{ _id: 'a3', displayName: 'Bob', avatarUrl: null }] }),
    ]
    useNotificationStore.setState({ notifications: testNotifs })
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    await user.click(screen.getByTestId('notifications-filter-button'))
    await user.click(screen.getByTestId('notifications-filter-LIKE'))
    expect(screen.getByTestId('notif-page-item-n1')).toBeInTheDocument()
    expect(screen.queryByTestId('notif-page-item-n2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('notif-page-item-n3')).not.toBeInTheDocument()
  })

  it('shows Follow back button for FOLLOW type notifications', () => {
    useNotificationStore.setState({
      notifications: [
        mockNotification({ _id: 'n1', type: 'FOLLOW', actors: [{ _id: 'follower1', displayName: 'Jane', avatarUrl: null }] }),
      ],
    })
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getAllByTestId('notif-page-follow-btn-follower1').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('notif-page-follow-btn-follower1')[0]).toHaveTextContent('Follow back')
  })

  it('shows 3-dots more menu for each notification', () => {
    useNotificationStore.setState({
      notifications: [mockNotification({ _id: 'n1' })],
    })
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByTestId('notif-page-more-n1')).toBeInTheDocument()
  })

  it('shows recent followers in sidebar', () => {
    useNotificationStore.setState({
      notifications: [
        mockNotification({ _id: 'n1', type: 'FOLLOW', actors: [{ _id: 'f1', displayName: 'Follower1', avatarUrl: null }] }),
      ],
    })
    render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>)
    expect(screen.getByText('RECENT FOLLOWERS')).toBeInTheDocument()
    expect(screen.getAllByText(/Follower1/).length).toBeGreaterThan(0)
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { NavBar } from '../NavBar'
import { useNotificationStore } from '@/features/notifications/model/useNotificationStore'
import { useAuthStore } from '@/features/auth/model/useAuthStore'

// Mock next modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/feed',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock notification dropdown & message dropdown
vi.mock('@/features/notifications/ui/NotificationDropdown', () => ({
  NotificationDropdown: () => <div data-testid="mock-notification-dropdown" />,
}))

vi.mock('@/features/messaging/ui/MessageDropdown', () => ({
  MessageDropdown: () => <div data-testid="mock-message-dropdown" />,
}))

// Mock notification API
vi.mock('@/features/notifications/api/notificationApi', () => ({
  fetchNotifications: vi.fn().mockResolvedValue({ notifications: [], pagination: { total: 0, page: 1, totalPages: 0 } }),
  fetchUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

// Mock SearchBar
vi.mock('../../SearchBar', () => ({
  SearchBar: () => <input data-testid="mock-search" />,
}))

vi.mock('@/features/social-graph/model/useBlockedUsers', () => ({
  useBlockedUsers: vi.fn().mockReturnValue({ data: [] }),
}))

describe('NavBar', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isDropdownOpen: false,
      currentPage: 1,
      totalPages: 1,
    })

    // Set authenticated user
    useAuthStore.setState({
      user: { id: 'user1', email: 'test@test.com', username: 'testuser', displayName: 'Test', role: 'listener', isVerified: false, createdAt: '' } as any,
      isAuthenticated: true,
      isInitialized: true,
    })
  })

  it('renders the navbar', () => {
    render(<NavBar />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  // ── Notification Dot Tests ──
  it('shows notification dot when unreadCount > 0', () => {
    useNotificationStore.setState({ unreadCount: 5 })
    render(<NavBar />)
    expect(screen.getByTestId('notification-unread-dot')).toBeInTheDocument()
  })

  it('does NOT show notification dot when unreadCount is 0', () => {
    useNotificationStore.setState({ unreadCount: 0 })
    render(<NavBar />)
    expect(screen.queryByTestId('notification-unread-dot')).not.toBeInTheDocument()
  })

  it('notification dot shows the unread count', () => {
    useNotificationStore.setState({ unreadCount: 5 })
    render(<NavBar />)
    const dot = screen.getByTestId('notification-unread-dot')
    expect(dot.textContent).toBe('5')
  })

  // ── Profile Dropdown Tests ──
  it('opens profile dropdown on chevron click', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByTestId('navbar-user-dropdown'))
    expect(screen.getByTestId('navbar-profile-dropdown-menu')).toBeInTheDocument()
  })

  it('profile dropdown contains all required items', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByTestId('navbar-user-dropdown'))

    expect(screen.getByTestId('navbar-dropdown-profile')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-dropdown-likes')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-dropdown-tracks')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-dropdown-insights')).toBeInTheDocument()
  })

  it('profile dropdown shows correct text labels', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByTestId('navbar-user-dropdown'))

    expect(screen.getAllByText('Profile').length).toBeGreaterThan(0)
    expect(screen.getByText('Likes')).toBeInTheDocument()
    expect(screen.getByText('Tracks')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  // ── More Dropdown Tests ──
  it('opens More (3-dots) dropdown on click', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByTestId('navbar-more-button'))
    expect(screen.getByTestId('navbar-more-dropdown-menu')).toBeInTheDocument()
  })

  it('More dropdown contains all required items', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByTestId('navbar-more-button'))

    expect(screen.getByTestId('navbar-more-about')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-legal')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-copyright')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-mobile-apps')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-artist-membership')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-support')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-keyboard')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-subscription')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-settings')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-more-signout')).toBeInTheDocument()
  })

  it('More dropdown has Sign out button', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByTestId('navbar-more-button'))
    expect(screen.getByTestId('navbar-more-signout')).toHaveTextContent('Sign out')
  })

  // ── Unauthenticated State ──
  it('shows sign in / create account when not authenticated', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isInitialized: true })
    render(<NavBar />)
    expect(screen.getByTestId('navbar-signin-button')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-create-account-button')).toBeInTheDocument()
  })
})

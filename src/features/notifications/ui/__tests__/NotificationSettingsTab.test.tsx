import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { NotificationSettingsTab } from '../NotificationSettingsTab'
import { useNotificationPreferencesStore } from '../../model/useNotificationPreferencesStore'

// Mock the API
vi.mock('../../api/notificationApi', () => ({
  updateNotificationPreferences: vi.fn().mockResolvedValue({
    pushEnabled: true,
    allowLikes: true,
    allowReposts: true,
    allowComments: true,
    allowFollows: true,
    allowMessages: true,
    allowNewTracks: true,
  }),
  fetchNotificationPreferences: vi.fn().mockResolvedValue({
    pushEnabled: true,
    allowLikes: true,
    allowReposts: true,
    allowComments: true,
    allowFollows: true,
    allowMessages: true,
    allowNewTracks: true,
    allowRecommended: true,
    emailLikes: true,
    emailReposts: true,
    emailComments: true,
    emailFollows: true,
    emailMessages: true,
    emailNewTracks: true,
    emailRecommended: true,
    messagePermission: 'Everyone',
  }),
}))

describe('NotificationSettingsTab', () => {
  beforeEach(() => {
    useNotificationPreferencesStore.getState().resetChanges()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the notification settings tab', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByTestId('notification-settings-tab')).toBeInTheDocument()
  })

  it('should render the Activities section', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByTestId('notification-settings-activities')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
  })

  it('should render the Updates from BioBeats section', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByTestId('notification-settings-updates')).toBeInTheDocument()
    expect(screen.getByText('Updates from BioBeats')).toBeInTheDocument()
  })

  it('should render all activity preference rows', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByText('New follower')).toBeInTheDocument()
    expect(screen.getByText('Repost of your post')).toBeInTheDocument()
    expect(screen.getByText('New post by followed user')).toBeInTheDocument()
    expect(screen.getByText('Likes and plays on your post')).toBeInTheDocument()
    expect(screen.getByText('Comment on your post')).toBeInTheDocument()
    expect(screen.getByText('Recommended Content')).toBeInTheDocument()
    expect(screen.getByText('New message')).toBeInTheDocument()
  })

  it('should render all update preference rows', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByText('BioBeats Feature Updates & Education')).toBeInTheDocument()
    expect(screen.getByText('Surveys and feedback')).toBeInTheDocument()
    expect(screen.getByText('Promotional & Partnership Content')).toBeInTheDocument()
    expect(screen.getByText('BioBeats newsletter')).toBeInTheDocument()
  })

  it('should render email checkboxes for activities', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByTestId('notification-pref-newFollower-email')).toBeInTheDocument()
    expect(screen.getByTestId('notification-pref-commentOnYourPost-email')).toBeInTheDocument()
  })

  it('should render devices checkboxes for activities', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByTestId('notification-pref-newFollower-devices')).toBeInTheDocument()
    expect(screen.getByTestId('notification-pref-likesAndPlaysOnYourPost-devices')).toBeInTheDocument()
  })

  it('should render a select dropdown for New message devices', () => {
    render(<NotificationSettingsTab />)
    const select = screen.getByTestId('notification-pref-newMessage-devices')
    expect(select.tagName).toBe('SELECT')
  })

  it('should render Cancel and Save buttons', () => {
    render(<NotificationSettingsTab />)
    expect(screen.getByTestId('notification-settings-cancel-btn')).toBeInTheDocument()
    expect(screen.getByTestId('notification-settings-save-btn')).toBeInTheDocument()
  })

  it('should disable Save button when no changes are made', () => {
    render(<NotificationSettingsTab />)
    const saveBtn = screen.getByTestId('notification-settings-save-btn')
    expect(saveBtn).toBeDisabled()
  })

  it('should enable Save button after toggling a preference', async () => {
    const user = userEvent.setup()
    render(<NotificationSettingsTab />)

    const checkbox = screen.getByTestId('notification-pref-newFollower-email')
    await user.click(checkbox)

    const saveBtn = screen.getByTestId('notification-settings-save-btn')
    expect(saveBtn).not.toBeDisabled()
  })

  it('should reset changes when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationSettingsTab />)

    // Make a change
    const checkbox = screen.getByTestId('notification-pref-commentOnYourPost-email')
    await user.click(checkbox)
    expect(screen.getByTestId('notification-settings-save-btn')).not.toBeDisabled()

    // Cancel
    await user.click(screen.getByTestId('notification-settings-cancel-btn'))
    expect(screen.getByTestId('notification-settings-save-btn')).toBeDisabled()
  })
})

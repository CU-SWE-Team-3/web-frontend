import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { EditProfileModal } from '../EditProfileModal'

const mockProfile = {
  displayName: 'Test Artist',
  firstName: 'Test',
  lastName: 'Artist',
  city: 'New York',
  country: 'USA',
  bio: 'This is my bio',
  profileUrl: 'testartist',
  avatarUrl: 'https://example.com/avatar.jpg',
  genres: ['pop', 'rock'],
  socialLinks: []
}

const mockOnClose = vi.fn()
const mockOnSaved = vi.fn()

const server = setupServer(
  http.patch('http://localhost:8000/api/profile/update', async ({ request }) => {
    return HttpResponse.json({ success: true })
  }),
  http.patch('http://localhost:8000/api/profile/upload-images', async ({ request }) => {
    return HttpResponse.json({ data: { avatarUrl: 'new-url.jpg' } })
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

describe('Edit Profile Modal', () => {
  it('does not render if closed', () => {
    render(
      <EditProfileModal open={false} onClose={mockOnClose} profile={mockProfile} />
    )
    expect(screen.queryByTestId('edit-profile-modal')).not.toBeInTheDocument()
  })

  it('renders and pre-fills current profile data', () => {
    render(
      <EditProfileModal open={true} onClose={mockOnClose} profile={mockProfile} />
    )
    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument()
    expect((screen.getByTestId('edit-profile-display-name-input') as HTMLInputElement).value).toBe('Test Artist')
    expect((screen.getByTestId('edit-profile-city-input') as HTMLInputElement).value).toBe('New York')
    expect((screen.getByTestId('edit-profile-country-input') as HTMLInputElement).value).toBe('USA')
    expect((screen.getByTestId('edit-profile-bio-input') as HTMLTextAreaElement).value).toBe('This is my bio')
    expect((screen.getByTestId('edit-profile-genres-input') as HTMLInputElement).value).toBe('pop, rock')
  })

  it('allows updating fields', async () => {
    const user = userEvent.setup()
    render(
      <EditProfileModal open={true} onClose={mockOnClose} profile={mockProfile} />
    )
    
    const displayInput = screen.getByTestId('edit-profile-display-name-input')
    const bioInput = screen.getByTestId('edit-profile-bio-input')
    
    await user.clear(displayInput)
    await user.type(displayInput, 'New Name')
    await user.clear(bioInput)
    await user.type(bioInput, 'New Bio')
    
    expect((displayInput as HTMLInputElement).value).toBe('New Name')
    expect((bioInput as HTMLTextAreaElement).value).toBe('New Bio')
  })

  it('submits updated data to the API and closes', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    const user = userEvent.setup()
    render(
      <EditProfileModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} profile={mockProfile} />
    )
    
    const displayInput = screen.getByTestId('edit-profile-display-name-input')
    await user.clear(displayInput)
    await user.type(displayInput, 'Another Name')
    
    await user.click(screen.getByTestId('edit-profile-save-button'))
    
    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})

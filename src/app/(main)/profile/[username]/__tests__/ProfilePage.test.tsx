import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import ProfilePage from '../page'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const server = setupServer(
  http.get('http://localhost:8000/api/profile/testuser', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 'test-id',
          permalink: 'testuser',
          displayName: 'Test Artist',
          avatarUrl: 'https://example.com/avatar.jpg',
          coverUrl: null,
          bio: 'I am a test artist',
          followerCount: 1500,
          followingCount: 30,
          trackCount: 10,
          socialLinks: [{ platform: 'twitter', url: 'https://twitter.com/test' }]
        }
      }
    })
  }),
  http.get('http://localhost:8000/api/network/test-id/followers', () => HttpResponse.json({ data: [] })),
  http.get('http://localhost:8000/api/network/test-id/following', () => HttpResponse.json({ data: [] })),
  http.get('http://localhost:8000/api/tracks/user/testuser', () => HttpResponse.json({ data: { tracks: [] } }))
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  queryClient.clear()
})
afterAll(() => server.close())

const renderProfile = (username = 'testuser') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage params={{ username }} />
    </QueryClientProvider>
  )
}

describe('ProfilePage Tests', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    useAuthStore.setState({ user: { permalink: 'testuser', id: 'test-id' } as any })
  })

  it('renders profile with correct user data', async () => {
    renderProfile()
    
    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument()
      expect(screen.getByTestId('profile-display-name')).toHaveTextContent('Test Artist')
      expect(screen.getByTestId('profile-bio')).toHaveTextContent('I am a test artist')
      expect(screen.getByTestId('profile-social-links')).toBeInTheDocument()
    })
  })

  it('avatar displays correctly', async () => {
    renderProfile()
    
    await waitFor(() => {
      const avatar = screen.getByTestId('profile-avatar') as HTMLImageElement
      expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar.jpg'))
    })
  })

  it('followers/following/tracks counts display correctly', async () => {
    renderProfile()
    
    await waitFor(() => {
      expect(screen.getByTestId('profile-followers-count')).toHaveTextContent('1500')
      expect(screen.getByTestId('profile-following-count')).toHaveTextContent('30')
      expect(screen.getByTestId('profile-tracks-count')).toHaveTextContent('10')
    })
  })

  it('upload more button is visible on own profile', async () => {
    renderProfile()
    
    await waitFor(() => {
      expect(screen.getAllByTestId('profile-upload-more-button').length).toBeGreaterThan(0)
    })
  })

  it('upload more button is NOT visible on other profiles', async () => {
    // Pretend logged in user is someone else
    useAuthStore.setState({ user: { permalink: 'otheruser', id: 'other-id' } as any })
    renderProfile('testuser')
    
    await waitFor(() => {
      expect(screen.queryByTestId('profile-upload-more-button')).not.toBeInTheDocument()
    })
  })

  it('edit button opens edit modal', async () => {
    const user = userEvent.setup()
    renderProfile()
    
    await waitFor(() => {
      expect(screen.getByTestId('profile-edit-button')).toBeInTheDocument()
    })
    
    await user.click(screen.getByTestId('profile-edit-button'))
    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument()
  })
})

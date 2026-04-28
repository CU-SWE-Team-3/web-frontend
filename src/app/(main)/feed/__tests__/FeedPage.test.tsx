import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import FeedPage from '../page'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/shared/ui', () => ({
  NavBar: () => <div data-testid="mock-navbar" />,
  SearchBar: () => <div data-testid="mock-search-bar" />,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/feed',
  useSearchParams: () => new URLSearchParams(),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const server = setupServer(
  http.get('http://localhost:8000/api/network/feed', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          _id: 'item-1',
          createdAt: new Date().toISOString(),
          track: {
            _id: 'track-1',
            title: 'Cool Track',
            artist: { displayName: 'Cool Artist' },
            playCount: 100,
            likeCount: 10,
            repostCount: 5,
            commentCount: 2
          }
        }
      ]
    })
  }),
  http.get('http://localhost:8000/api/network/suggested', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { _id: 'artist-1', permalink: 'suggestedartist', displayName: 'Suggested Artist', followerCount: 500 }
      ]
    })
  }),
  http.post('http://localhost:8000/api/network/artist-1/follow', () => {
    return HttpResponse.json({ success: true })
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  queryClient.clear()
})
afterAll(() => server.close())

const renderFeed = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedPage />
    </QueryClientProvider>
  )
}

describe('Feed Page', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    useAuthStore.setState({ isAuthenticated: true, user: { id: 'test-user' } as any })
  })

  it('renders feed page', async () => {
    renderFeed()
    await waitFor(() => {
      expect(screen.getByTestId('feed-page')).toBeInTheDocument()
    })
  })

  it('loads and displays feed tracks', async () => {
    renderFeed()
    
    await waitFor(() => {
      expect(screen.getByTestId('feed-track-list')).toBeInTheDocument()
      expect(screen.getAllByTestId('feed-track-item').length).toBeGreaterThan(0)
    })
    
    const firstItem = screen.getAllByTestId('feed-track-item')[0]
    expect(within(firstItem).getByTestId('track-card-title')).toHaveTextContent('Cool Track')
  })

  it('loads and displays suggested artists', async () => {
    renderFeed()
    
    await waitFor(() => {
      expect(screen.getByTestId('feed-artist-suggestions')).toBeInTheDocument()
      expect(screen.getByText('Suggested Artist')).toBeInTheDocument()
    })
  })

  it('artist follow button toggles state on click', async () => {
    const user = userEvent.setup()
    renderFeed()
    
    await waitFor(() => {
      expect(screen.getAllByTestId('feed-artist-follow-button').length).toBeGreaterThan(0)
    })
    
    const followBtn = screen.getAllByTestId('feed-artist-follow-button')[0]
    expect(followBtn).toHaveTextContent('Follow')
    
    await user.click(followBtn)
    
    await waitFor(() => {
      expect(followBtn).toHaveTextContent('Following')
    })
  })
})

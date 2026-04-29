import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import SettingsPage from '../page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/shared/ui', () => ({
  NavBar: () => <div data-testid="mock-navbar" />,
  SearchBar: () => <div data-testid="mock-search-bar" />,
  SkeletonLoader: () => <div data-testid="mock-skeleton" />,
  EmptyState: ({ title, icon }: any) => <div data-testid="mock-empty-state">{title}</div>,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/settings',
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const server = setupServer(
  http.get('http://localhost:8000/api/network/blocked', () => {
    return HttpResponse.json([
      { id: 'blocked-1', username: 'baduser', displayName: 'Bad User', avatarUrl: null }
    ])
  }),
  http.delete('http://localhost:8000/api/network/blocked/blocked-1', () => {
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

const renderSettings = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsPage />
    </QueryClientProvider>
  )
}

describe('Settings Page', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
  })

  it('renders settings page', async () => {
    renderSettings()
    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument()
    })
  })

  it('renders privacy tab by default with blocked users list', async () => {
    renderSettings()
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-blocked-users-list')).toBeInTheDocument()
    })
  })

  it('loads and displays blocked users', async () => {
    renderSettings()
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-blocked-user-item')).toBeInTheDocument()
      expect(screen.getByText('Bad User')).toBeInTheDocument()
    })
  })

  it('unblock button removes user', async () => {
    const user = userEvent.setup()
    renderSettings()
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-unblock-button')).toBeInTheDocument()
    })
    
    await user.click(screen.getByTestId('settings-unblock-button'))
    
    await waitFor(() => {
      expect(screen.getByText('User unblocked successfully.')).toBeInTheDocument()
    })
  })
})

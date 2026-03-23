import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
import ConfirmEmailUpdatePage from '../page'

// --- Mocking ---
vi.mock('axios')

const mockPush = vi.fn()
let mockToken: string | null = 'valid-update-token'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'token') return mockToken
      return null
    }),
  }),
}))

describe('ConfirmEmailUpdatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = 'valid-update-token'
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
  })

  it('shows error if no token is found', () => {
    mockToken = null
    render(<ConfirmEmailUpdatePage />)
    
    expect(screen.getByTestId('confirm-email-page')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-email-error')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-email-error')).toHaveTextContent(/no confirmation token found/i)
  })

  it('shows loading state initially and then success upon successful API call', async () => {
    ;(axios.post as any).mockResolvedValueOnce({ data: { success: true } })
    render(<ConfirmEmailUpdatePage />)
    
    expect(screen.getByTestId('confirm-email-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/confirm-email-update',
        { token: 'valid-update-token' },
        { withCredentials: true }
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('confirm-email-success')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-email-success')).toHaveTextContent(/successfully updated/i)
    })
    
    fireEvent.click(screen.getByTestId('confirm-email-signin-btn'))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('shows error state upon failed API call, displaying backend message', async () => {
    ;(axios.post as any).mockRejectedValueOnce({ response: { data: { message: 'Custom backend expiration message' } } })
    render(<ConfirmEmailUpdatePage />)

    await waitFor(() => {
      expect(screen.getByTestId('confirm-email-error')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-email-error')).toHaveTextContent(/Custom backend expiration message/i)
    })
    
    fireEvent.click(screen.getByTestId('confirm-email-back-btn'))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

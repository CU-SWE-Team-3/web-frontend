import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
import VerifyEmailPage from '../page'

// --- Mocking ---
vi.mock('axios')

const mockPush = vi.fn()
let mockToken: string | null = 'valid-email-token'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'token') return mockToken
      return null
    }),
  }),
}))

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = 'valid-email-token'
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
  })

  it('shows error if no token is found', () => {
    mockToken = null
    render(<VerifyEmailPage />)
    
    expect(screen.getByTestId('verify-email-page')).toBeInTheDocument()
    expect(screen.getByTestId('verify-email-error')).toBeInTheDocument()
    expect(screen.getByTestId('verify-email-error')).toHaveTextContent(/no verification token found/i)
  })

  it('shows loading state initially and then success upon successful API call', async () => {
    ;(axios.post as any).mockResolvedValueOnce({ data: { success: true } })
    render(<VerifyEmailPage />)
    
    expect(screen.getByTestId('verify-email-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/verify-email',
        { token: 'valid-email-token' },
        { withCredentials: true }
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('verify-email-success')).toBeInTheDocument()
      expect(screen.getByTestId('verify-email-success')).toHaveTextContent(/verified successfully/i)
    })
    
    fireEvent.click(screen.getByTestId('verify-email-signin-btn'))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('shows error state upon failed API call', async () => {
    ;(axios.post as any).mockRejectedValueOnce(new Error('Invalid token'))
    render(<VerifyEmailPage />)

    await waitFor(() => {
      expect(screen.getByTestId('verify-email-error')).toBeInTheDocument()
      expect(screen.getByTestId('verify-email-error')).toHaveTextContent(/invalid or has expired/i)
    })
    
    fireEvent.click(screen.getByTestId('verify-email-back-btn'))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

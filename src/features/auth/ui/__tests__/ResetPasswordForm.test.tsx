import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
import ResetPasswordForm from '../ResetPasswordForm'

// --- Mocking ---
vi.mock('axios')

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'token') return 'valid-reset-token'
      return null
    }),
  }),
}))

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
  })

  it('renders the reset password form correctly', () => {
    render(<ResetPasswordForm />)
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-new-input')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-confirm-input')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-submit-btn')).toBeInTheDocument()
  })

  it('shows validation errors for short passwords or mismatches', async () => {
    render(<ResetPasswordForm />)
    
    fireEvent.change(screen.getByTestId('reset-password-new-input'), { target: { value: 'short' } })
    fireEvent.submit(screen.getByTestId('reset-password-form'))
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('reset-password-new-input'), { target: { value: 'validpassword1' } })
    fireEvent.change(screen.getByTestId('reset-password-confirm-input'), { target: { value: 'mismatch' } })
    fireEvent.submit(screen.getByTestId('reset-password-form'))
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('calls the API with token and newPassword and shows success message', async () => {
    ;(axios.post as any).mockResolvedValueOnce({ data: { success: true } })
    render(<ResetPasswordForm />)
    
    fireEvent.change(screen.getByTestId('reset-password-new-input'), { target: { value: 'strongpassword123' } })
    fireEvent.change(screen.getByTestId('reset-password-confirm-input'), { target: { value: 'strongpassword123' } })
    
    fireEvent.submit(screen.getByTestId('reset-password-form'))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/reset-password',
        { token: 'valid-reset-token', newPassword: 'strongpassword123' },
        { withCredentials: true }
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-success')).toBeInTheDocument()
    })
    
    // Check navigation to login
    fireEvent.click(screen.getByTestId('reset-password-signin-btn'))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('displays API error appropriately', async () => {
    ;(axios.post as any).mockRejectedValueOnce(new Error('API failure'))
    render(<ResetPasswordForm />)
    
    fireEvent.change(screen.getByTestId('reset-password-new-input'), { target: { value: 'strongpassword123' } })
    fireEvent.change(screen.getByTestId('reset-password-confirm-input'), { target: { value: 'strongpassword123' } })
    
    fireEvent.submit(screen.getByTestId('reset-password-form'))

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-error')).toBeInTheDocument()
      expect(screen.getByTestId('reset-password-error')).toHaveTextContent(/expired or is invalid/i)
    })
  })
})

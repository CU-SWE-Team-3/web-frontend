import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import RegisterForm from '../RegisterForm'
import { useAuthStore } from '../../model/useAuthStore'
import { ROUTES } from '@/shared/constants/routes'

// Mock ReCAPTCHA
vi.mock('react-google-recaptcha', () => {
  return {
    default: (props: any) => {
      return (
        <div data-testid="mock-recaptcha">
          <button data-testid="solve-captcha" onClick={() => props.onChange('fake-captcha-token')}>Solve</button>
        </div>
      )
    }
  }
})

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const server = setupServer(
  http.post('http://localhost:8000/api/auth/register', async ({ request }) => {
    return HttpResponse.json({
      data: {
        user: { id: '2', email: 'new@example.com', displayName: 'New User' },
        accessToken: 'new-jwt-token'
      }
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({ user: null, isAuthenticated: false })
})
afterAll(() => server.close())

describe('RegisterForm', () => {
  it('renders correctly', () => {
    render(<RegisterForm />)
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    expect(screen.getByTestId('register-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('register-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('register-submit-button')).toBeInTheDocument()
  })

  it('accepts input for fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    await user.type(screen.getByTestId('register-displayname-input'), 'New User')
    await user.type(screen.getByTestId('register-email-input'), 'new@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-input'), 'password123')
    
    expect((screen.getByTestId('register-email-input') as HTMLInputElement).value).toBe('new@example.com')
  })

  it('shows error if passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    await user.type(screen.getByTestId('register-displayname-input'), 'New User')
    await user.type(screen.getByTestId('register-email-input'), 'new@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-input'), 'password456')
    await user.click(screen.getByTestId('solve-captcha')) // Provide token
    await user.click(screen.getByTestId('register-submit-button'))
    
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
  })

  it('submits correctly and redirects on successful registration auto-login', async () => {
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    render(<RegisterForm />)
    
    await user.type(screen.getByTestId('register-displayname-input'), 'New User')
    await user.type(screen.getByTestId('register-email-input'), 'new@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-input'), 'password123')
    await user.click(screen.getByTestId('solve-captcha'))
    await user.click(screen.getByTestId('register-submit-button'))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.DASHBOARD)
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(localStorage.getItem('accessToken')).toBe('new-jwt-token')
  })

  it('shows success screen rather than redirecting if backend does not auto-login', async () => {
    server.use(
      http.post('http://localhost:8000/api/auth/register', () => {
        return HttpResponse.json({ success: true }) // No user token returned
      })
    )
    
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    render(<RegisterForm />)
    
    await user.type(screen.getByTestId('register-displayname-input'), 'New User')
    await user.type(screen.getByTestId('register-email-input'), 'new@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-input'), 'password123')
    await user.click(screen.getByTestId('solve-captcha'))
    await user.click(screen.getByTestId('register-submit-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('register-success')).toBeInTheDocument()
    })
  })
})

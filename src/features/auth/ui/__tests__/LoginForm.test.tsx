import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import LoginForm from '../LoginForm'
import { useAuthStore } from '../../model/useAuthStore'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const server = setupServer(
  http.post('http://localhost:8000/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' },
          accessToken: 'fake-jwt-token'
        }
      })
    }
    return HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
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

describe('LoginForm', () => {
  it('renders correctly', () => {
    render(<LoginForm />)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument()
  })

  it('accepts input for email and password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByTestId('login-email-input') as HTMLInputElement
    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('calls login API with correct credentials and redirects', async () => {
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    render(<LoginForm />)
    
    await user.type(screen.getByTestId('login-email-input'), 'test@example.com')
    await user.type(screen.getByTestId('login-password-input'), 'password123')
    await user.click(screen.getByTestId('login-submit-button'))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/feed')
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.email).toBe('test@example.com')
  })

  it('saves token to localStorage on successful login', async () => {
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    render(<LoginForm />)
    
    await user.type(screen.getByTestId('login-email-input'), 'test@example.com')
    await user.type(screen.getByTestId('login-password-input'), 'password123')
    await user.click(screen.getByTestId('login-submit-button'))
    
    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('fake-jwt-token')
    })
  })

  it('shows error message on wrong credentials', async () => {
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    render(<LoginForm />)
    
    await user.type(screen.getByTestId('login-email-input'), 'wrong@example.com')
    await user.type(screen.getByTestId('login-password-input'), 'badpass123')
    await user.click(screen.getByTestId('login-submit-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid email or password.')
    })
  })
})

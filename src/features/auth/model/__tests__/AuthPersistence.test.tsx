import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useAuthStore } from '../useAuthStore'

const server = setupServer(
  http.get('http://localhost:8000/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (authHeader === 'Bearer valid-token') {
      return HttpResponse.json({
        data: {
          user: { id: '1', email: 'test@example.com', displayName: 'Valid User' }
        }
      })
    }
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  })
)

beforeAll(() => {
  server.listen()
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
})
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  vi.clearAllMocks()
  useAuthStore.setState({ user: null, isAuthenticated: false, isInitialized: false })
})
afterAll(() => server.close())

describe('Auth Persistence Tests', () => {
  it('saves token to localStorage on login', () => {
    useAuthStore.getState().login({ id: '1', email: 'test@example.com', displayName: 'Test' } as any, 'new-token')
    expect(localStorage.getItem('accessToken')).toBe('new-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('reads token from localStorage and restores session on initAuth', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    localStorage.setItem('accessToken', 'valid-token')
    
    await useAuthStore.getState().initAuth()
    
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.displayName).toBe('Valid User')
    expect(useAuthStore.getState().isInitialized).toBe(true)
  })

  it('clears localStorage and remains unauthenticated if token is invalid/expired', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    localStorage.setItem('accessToken', 'invalid-token')
    
    await useAuthStore.getState().initAuth()
    
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('keeps user logged in after page refresh if token is valid', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
    localStorage.setItem('accessToken', 'valid-token')
    
    // Simulate initial page load
    useAuthStore.setState({ user: null, isAuthenticated: false, isInitialized: false })
    await useAuthStore.getState().initAuth()
    
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    
    // Simulate refresh (reset state but keep localStorage)
    useAuthStore.setState({ user: null, isAuthenticated: false, isInitialized: false })
    await useAuthStore.getState().initAuth()
    
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
})

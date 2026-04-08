import axios from 'axios'

export const API_TIMEOUTS = {
  default: 30_000,
  uploadInit: 120_000,
  uploadBinary: 300_000,
  uploadConfirm: 120_000,
  uploadMetadata: 60_000,
} as const

// ─── Axios Client ─────────────────────────────────────────────────────────────
// This is the one HTTP client used by the whole app.
// UI components NEVER call fetch() directly — they always call repository functions,
// which use this client.

const apiClient = axios.create({
  // Replace this with your real backend URL when the backend team is ready
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUTS.default,
  withCredentials: true, // Needed for HttpOnly cookie authentication
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attaches the JWT token to every outgoing request
// so the user doesn't have to re-authenticate on each call.
apiClient.interceptors.request.use((config) => {
  // Read token from localStorage (set by useAuthStore on login)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ─── Response Interceptor ─────────────────────────────────────────────────────
// If the server returns 401 (token expired), clear the session and redirect to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // localStorage.removeItem('accessToken')
        // DEV BYPASS: Temporarily disable kicking users out on 401 errors
        console.warn('API returned 401 Unauthorized but skipped redirect for Dev Bypass');
        // window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

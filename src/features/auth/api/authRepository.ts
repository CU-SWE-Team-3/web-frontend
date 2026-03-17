import apiClient from '@/shared/api/client'
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/shared/types'

// ─── Auth Repository ──────────────────────────────────────────────────────────
// All auth-related HTTP calls live here.
// The UI never calls fetch() or axios directly — it always uses these functions.

export const authRepository = {
  /**
   * Log in with email + password.
   * Returns user data and JWT tokens.
   */
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload)
    return response.data
  },

  /**
   * Register a new account.
   * Requires a CAPTCHA token to prevent bots.
   */
  register: async (payload: RegisterPayload): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/register', payload)
    return response.data
  },

  /**
   * Send a password reset email to the user.
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', payload)
    return response.data
  },

  /**
   * Reset the password using
   * the token from the reset email link.
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload)
    return response.data
  },

  /**
   * Verify the user's email address
   * using the token from the verification email.
   */
  verifyEmail: async (token: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token })
    return response.data
  },

  /**
   * Get the Google OAuth login URL.
   * The frontend should redirect the user to this URL.
   */
  googleLogin: async (): Promise<{ url: string }> => {
    // Note: The structure of this response depends on how your backend implemented it.
    // Sometimes it returns JSON { url: "..." }, sometimes it redirects directly.
    // Assuming it returns JSON with the URL:
    const response = await apiClient.get<{ url: string }>('/auth/google')
    return response.data
  },

  /**
   * Handle the callback after the user logs in with Google.
   * The backend should return the user data and tokens.
   */
  handleGoogleCallback: async (searchParams: URLSearchParams): Promise<ApiResponse<AuthResponse>> => {
    const queryString = searchParams.toString()
    const response = await apiClient.get<ApiResponse<AuthResponse>>(`/auth/google/callback?${queryString}`)
    return response.data
  },
}

// ─── Public API for the auth feature ─────────────────────────────────────────
// Other parts of the app should only import from this file.
// Never import directly from internal files like '../ui/LoginForm'.

export { default as LoginForm } from './ui/LoginForm'
export { default as RegisterForm } from './ui/RegisterForm'
export { default as ForgotPasswordForm } from './ui/ForgotPasswordForm'
export { default as ResetPasswordForm } from './ui/ResetPasswordForm'
export { useAuthStore } from './model/useAuthStore'
export { authRepository } from './api/authRepository'

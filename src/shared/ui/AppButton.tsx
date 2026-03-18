import React from 'react'

// ─── Props Definition ─────────────────────────────────────────────────────────
// We list every option this button can accept.
export interface AppButtonProps {
  children: React.ReactNode           // The text/icon inside the button
  onClick?: (e: React.MouseEvent) => void // Updated to accept MouseEvent
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' // Added outline
  fullWidth?: boolean                 // Should it stretch to full width?
  disabled?: boolean                  // Is it greyed out / unclickable?
  isLoading?: boolean                 // Show a spinner instead of text?
  className?: string                  // Extra custom classes if needed
  style?: React.CSSProperties         // Added for custom styling
}

// ─── Style Map ────────────────────────────────────────────────────────────────
const variantStyles: Record<string, string> = {
  primary:   'bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold',
  secondary: 'bg-[#333] hover:bg-[#444] text-white font-bold border border-[#444]',
  ghost:     'bg-transparent hover:bg-white/10 text-white font-medium underline',
  outline:   'bg-transparent hover:bg-white/5 text-white border border-[#333]',
}

// ─── Component ────────────────────────────────────────────────────────────────
const AppButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  className = '',
  style = {},
}: AppButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      disabled={disabled || isLoading}
      className={`
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        h-10 px-6 rounded-sm text-sm
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* Show a spinner while loading, otherwise show text */}
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  )
}

export default AppButton

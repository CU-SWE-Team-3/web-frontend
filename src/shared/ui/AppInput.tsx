import React from 'react'

// ─── Props ────────────────────────────────────────────────────────────────────
interface AppInputProps {
  id: string                          // Unique ID (required for accessibility)
  label?: string                      // Label shown above the input
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string                      // Red error message shown below input
  required?: boolean
  disabled?: boolean
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────
const AppInput = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
}: AppInputProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Label — shown above the input box */}
      {label && (
        <label htmlFor={id} className="text-sm text-gray-300 font-medium">
          {label}
          {required && <span className="text-[#ff5500] ml-1">*</span>}
        </label>
      )}

      {/* The actual input field */}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full h-10 px-3
          bg-[#333333] border rounded-sm
          text-white text-sm placeholder:text-[#777]
          outline-none transition-colors duration-150
          ${error ? 'border-red-500' : 'border-[#444] focus:border-white'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />

      {/* Error message — only shows when there's an error */}
      {error && (
        <p className="text-red-500 text-xs mt-0.5">{error}</p>
      )}
    </div>
  )
}

export default AppInput

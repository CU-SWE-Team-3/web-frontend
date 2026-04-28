'use client'

import { type FC, useEffect, useState, useCallback } from 'react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
const COLORS = {
  success: '#22c55e',
  error:   '#ef4444',
  info:    '#3b82f6',
  warning: '#f59e0b',
}

interface AdminToastItem {
  id: string
  message: string
  variant: ToastVariant
}

// Simple singleton store for toast queue
let toastListeners: ((t: AdminToastItem[]) => void)[] = []
let toasts: AdminToastItem[] = []

export function showAdminToast(message: string, variant: ToastVariant = 'info') {
  const id = Date.now().toString()
  toasts = [...toasts, { id, message, variant }]
  toastListeners.forEach((fn) => fn(toasts))
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    toastListeners.forEach((fn) => fn(toasts))
  }, 4000)
}

export const AdminToastProvider: FC = () => {
  const [items, setItems] = useState<AdminToastItem[]>([])

  useEffect(() => {
    const listener = (updated: AdminToastItem[]) => setItems([...updated])
    toastListeners.push(listener)
    return () => { toastListeners = toastListeners.filter((l) => l !== listener) }
  }, [])

  return (
    <div style={{
      position: 'fixed', top: '1.25rem', right: '1.25rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
      maxWidth: '380px', width: '100%',
    }}>
      {items.map((item) => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#1a1a1a',
          border: `1px solid ${COLORS[item.variant]}33`,
          borderLeft: `4px solid ${COLORS[item.variant]}`,
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          animation: 'slideInRight 250ms ease',
          color: '#fff',
          fontSize: '0.875rem',
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            background: COLORS[item.variant],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, color: '#fff',
          }}>
            {ICONS[item.variant]}
          </span>
          <span style={{ flex: 1 }}>{item.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideInRight {
        from { opacity: 0; transform: translateX(24px); }
        to   { opacity: 1; transform: translateX(0); }
      }`}</style>
    </div>
  )
}

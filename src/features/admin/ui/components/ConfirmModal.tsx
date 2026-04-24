'use client'

import { type FC } from 'react'
import { AdminModal } from './AdminModal'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
  isDanger?: boolean
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  open, onClose, onConfirm, title = 'Are you sure?', message,
  confirmLabel = 'Confirm', isLoading = false, isDanger = true
}) => {
  return (
    <AdminModal open={open} onClose={onClose} title={title} size="sm">
      <p style={{ color: '#ccc', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem', background: '#2a2a2a', border: '1px solid #333',
            color: '#ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1.25rem',
            background: isDanger ? '#cf0000' : '#ff5500',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {isLoading && (
            <span style={{
              width: 14, height: 14,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
          {confirmLabel}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminModal>
  )
}

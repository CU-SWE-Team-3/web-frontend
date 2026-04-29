'use client'

import { type FC, type ReactNode, useEffect, useRef } from 'react'
import s from './AdminModal.module.scss'

interface AdminModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const WIDTH = { sm: '400px', md: '520px', lg: '700px' }

export const AdminModal: FC<AdminModalProps> = ({
  open, onClose, title, description, children, size = 'md'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className={s.overlay}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <div className={s.panel} style={{ maxWidth: WIDTH[size] }}>
        {(title || description) && (
          <div className={s.header}>
            {title && <h2 className={s.title}>{title}</h2>}
            {description && <p className={s.description}>{description}</p>}
          </div>
        )}
        <button className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  )
}

'use client'

import { type FC, type ReactNode } from 'react'
import { AdminGuard } from './AdminGuard'
import { AdminSidebar } from './AdminSidebar'
import { AdminToastProvider } from './components/AdminToast'
import { useAdminSocketUpdates } from '../hooks/useAdminSocketUpdates'

interface AdminLayoutProps {
  children: ReactNode
  pageTitle?: string
}

export const AdminLayout: FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  useAdminSocketUpdates()

  return (
    <AdminGuard>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#111',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <AdminSidebar />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {pageTitle && (
            <header style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #1e1e1e',
              background: '#111',
              position: 'sticky', top: 0, zIndex: 5,
            }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                {pageTitle}
              </h1>
            </header>
          )}
          <div style={{ flex: 1, padding: '1.75rem', overflow: 'auto' }}>
            {children}
          </div>
        </main>

        {/* Global admin toast notifications */}
        <AdminToastProvider />
      </div>
    </AdminGuard>
  )
}

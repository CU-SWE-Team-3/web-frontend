'use client'

import { type FC, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminStore } from '../model/useAdminStore'
import { ROUTES } from '@/shared/constants/routes'

const NAV_ITEMS = [
  {
    key: 'reports',
    href: ROUTES.ADMIN_REPORTS,
    label: 'Reports',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    key: 'content',
    href: ROUTES.ADMIN_CONTENT,
    label: 'Content',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
      </svg>
    ),
  },
  {
    key: 'health',
    href: ROUTES.ADMIN_HEALTH,
    label: 'Health',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

export const AdminSidebar: FC = () => {
  const pathname = usePathname()
  const { pendingReportCount, sidebarCollapsed, setSidebarCollapsed } = useAdminStore()

  return (
    <aside style={{
      width: sidebarCollapsed ? 64 : 220,
      minHeight: '100vh',
      background: '#0e0e0e',
      borderRight: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 220ms ease',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Header */}
      <div style={{
        padding: sidebarCollapsed ? '1.5rem 0.75rem' : '1.5rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        marginBottom: '1rem'
      }}>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#ff5500', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              BIOBEATS
            </div>
            <div style={{ color: '#666', fontSize: '0.6rem', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}>
              ADMIN
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none', border: '1px solid #1e1e1e', borderRadius: 4,
            color: '#666', cursor: 'pointer', padding: '0.25rem',
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#1e1e1e' }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {sidebarCollapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false
          return (
            <Link
              key={item.key}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: sidebarCollapsed ? 0 : '0.85rem',
                padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                borderRadius: 6,
                background: isActive ? '#ff55001a' : 'transparent',
                border: `1px solid ${isActive ? '#ff55004d' : 'transparent'}`,
                color: isActive ? '#ff5500' : '#888',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 150ms ease',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#888' }}
            >
              <span style={{ flexShrink: 0, position: 'relative' }}>
                {item.icon}
                {/* Badge for pending reports */}
                {item.key === 'reports' && pendingReportCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -5,
                    background: '#ff5500', color: '#fff',
                    fontSize: '0.6rem', fontWeight: 700,
                    borderRadius: '999px',
                    padding: '1px 5px',
                    minWidth: 16, textAlign: 'center', lineHeight: '14px',
                  }}>
                    {pendingReportCount > 99 ? '99+' : pendingReportCount}
                  </span>
                )}
              </span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer — back to main app */}
      <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid #1e1e1e' }}>
        <Link
          href={ROUTES.DASHBOARD}
          title={sidebarCollapsed ? 'Back to App' : undefined}
          style={{
            display: 'flex', alignItems: 'center',
            gap: sidebarCollapsed ? 0 : '0.75rem',
            padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
            borderRadius: 8, color: '#444',
            textDecoration: 'none', fontSize: '0.8rem',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            transition: 'color 150ms',
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          {!sidebarCollapsed && <span>Back to App</span>}
        </Link>
      </div>
    </aside>
  )
}

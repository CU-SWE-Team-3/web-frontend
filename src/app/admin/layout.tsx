import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard — BioBeats',
  description: 'BioBeats moderation and administration panel',
}

/**
 * Admin section layout — wraps every /admin/* page.
 * The AdminGuard inside AdminLayout handles role enforcement.
 * We use a plain div wrapper here so the Next.js layout nesting works properly;
 * the full AdminLayout (with sidebar) is applied per-page so each page can
 * pass its own pageTitle prop.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

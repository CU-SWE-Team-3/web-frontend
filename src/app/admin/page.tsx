import { redirect } from 'next/navigation'
import { ROUTES } from '@/shared/constants/routes'

/**
 * /admin → redirects to /admin/reports (default panel)
 */
export default function AdminIndexPage() {
  redirect(ROUTES.ADMIN_REPORTS)
}

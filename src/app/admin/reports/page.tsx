import type { Metadata } from 'next'
import { AdminLayout } from '@/features/admin'
import ReportsPanel from '@/features/admin/ui/panels/ReportsPanel'

export const metadata: Metadata = {
  title: 'Reports — BioBeats Admin',
  description: 'Review and resolve content reports',
}

export default function AdminReportsPage() {
  return (
    <AdminLayout pageTitle="Report System">
      <ReportsPanel />
    </AdminLayout>
  )
}

import type { Metadata } from 'next'
import { AdminLayout } from '@/features/admin'
import HealthPanel from '@/features/admin/ui/panels/HealthPanel'

export const metadata: Metadata = {
  title: 'Platform Health — BioBeats Admin',
  description: 'Platform analytics and health metrics',
}

export default function AdminHealthPage() {
  return (
    <AdminLayout pageTitle="Platform Health">
      <HealthPanel />
    </AdminLayout>
  )
}

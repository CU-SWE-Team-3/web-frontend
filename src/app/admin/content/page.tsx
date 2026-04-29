import type { Metadata } from 'next'
import { AdminLayout } from '@/features/admin'
import ContentPanel from '@/features/admin/ui/panels/ContentPanel'

export const metadata: Metadata = {
  title: 'Content Management — BioBeats Admin',
  description: 'Manage tracks and user accounts',
}

export default function AdminContentPage() {
  return (
    <AdminLayout pageTitle="Content Management">
      <ContentPanel />
    </AdminLayout>
  )
}

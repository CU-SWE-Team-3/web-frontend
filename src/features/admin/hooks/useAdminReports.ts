'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReports, updateReportStatus } from '../api/adminApi'
import { useAdminStore } from '../model/useAdminStore'
import type { ReportData } from '@/shared/types'

export function useAdminReports(page = 1, limit = 20) {
  const setPendingCount = useAdminStore((s) => s.setPendingReportCount)

  const query = useQuery({
    queryKey: ['admin-reports', page, limit],
    queryFn: async () => {
      const res = await getReports({ page, limit })
      const pending = (res.data ?? []).filter((r: ReportData) => r.status === 'Pending').length
      setPendingCount(pending)
      return res
    },
    staleTime: 30_000,
  })

  return query
}

export function useUpdateReportStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Pending' | 'Reviewed' | 'Resolved' }) =>
      updateReportStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
    },
  })
}

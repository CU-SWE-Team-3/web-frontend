'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../api/adminApi'

/** Fetches platform health stats — auto-refreshes every 60 seconds */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000, // auto-refresh every 60s per spec
    staleTime: 30_000,
  })
}

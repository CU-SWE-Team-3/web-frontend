'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getDailyActiveUsers, getTopTracks } from '../api/adminApi'

/** Fetches platform health stats — auto-refreshes every 60 seconds */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

/** Fetches daily active users time-series (last N days) */
export function useDailyActiveUsers(days = 30) {
  return useQuery({
    queryKey: ['admin-daily-users', days],
    queryFn: () => getDailyActiveUsers(days),
    staleTime: 5 * 60_000,
  })
}

/** Fetches top N tracks by play count */
export function useTopTracks(limit = 10) {
  return useQuery({
    queryKey: ['admin-top-tracks', limit],
    queryFn: () => getTopTracks(limit),
    staleTime: 5 * 60_000,
  })
}

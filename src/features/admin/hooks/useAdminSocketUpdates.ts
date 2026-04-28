'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { connectSocket, getSocket } from '@/shared/socket'

const ADMIN_REPORT_EVENTS = [
  'admin_report_created',
  'admin_report_updated',
  'report_created',
  'report_updated',
] as const

const ADMIN_TRACK_EVENTS = [
  'admin_track_updated',
  'track_moderated',
  'track_hidden',
  'track_restored',
] as const

const ADMIN_USER_EVENTS = [
  'admin_user_updated',
  'user_suspended',
  'user_restored',
] as const

const ADMIN_STATS_EVENTS = [
  'admin_stats_updated',
  'stats_updated',
  'dashboard_stats_updated',
] as const

export function useAdminSocketUpdates() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userRole = useAuthStore((s) => s.user?.role)

  useEffect(() => {
    if (!isAuthenticated || userRole?.toLowerCase() !== 'admin') return

    const socket = getSocket() ?? connectSocket()

    const refreshReports = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }

    const refreshTracks = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-top-tracks'] })
    }

    const refreshUsers = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-daily-users'] })
    }

    const refreshStats = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-daily-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-top-tracks'] })
    }

    ADMIN_REPORT_EVENTS.forEach((event) => socket.on(event, refreshReports))
    ADMIN_TRACK_EVENTS.forEach((event) => socket.on(event, refreshTracks))
    ADMIN_USER_EVENTS.forEach((event) => socket.on(event, refreshUsers))
    ADMIN_STATS_EVENTS.forEach((event) => socket.on(event, refreshStats))

    return () => {
      ADMIN_REPORT_EVENTS.forEach((event) => socket.off(event, refreshReports))
      ADMIN_TRACK_EVENTS.forEach((event) => socket.off(event, refreshTracks))
      ADMIN_USER_EVENTS.forEach((event) => socket.off(event, refreshUsers))
      ADMIN_STATS_EVENTS.forEach((event) => socket.off(event, refreshStats))
    }
  }, [isAuthenticated, queryClient, userRole])
}

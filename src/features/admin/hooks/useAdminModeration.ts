'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  suspendUser, restoreUser, hideTrack, restoreTrack,
  warnUser, broadcastNotification,
  getAdminUsers, getAdminTracks,
} from '../api/adminApi'
import type { AdminUser, AdminTrack } from '../api/adminApi'

// ─── User Queries ─────────────────────────────────────────────────────────────

export function useAdminUsers(params?: {
  page?: number; limit?: number; search?: string; status?: 'Active' | 'Suspended' | 'Deleted'
}) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getAdminUsers(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ─── Track Queries ────────────────────────────────────────────────────────────

export function useAdminTracks(params?: {
  page?: number; limit?: number; search?: string
  genre?: string; status?: 'Published' | 'Draft'; uploadDate?: 'All Time' | '7days' | '30days'
}) {
  return useQuery({
    queryKey: ['admin-tracks', params],
    queryFn: () => getAdminTracks(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ─── User Mutations ───────────────────────────────────────────────────────────

export function useSuspendUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useRestoreUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restoreUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useWarnUser() {
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      warnUser(id, message),
  })
}

// ─── Track Mutations ──────────────────────────────────────────────────────────

export function useHideTrack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hideTrack(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tracks'] }),
  })
}

export function useRestoreTrack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restoreTrack(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tracks'] }),
  })
}

// ─── Broadcast ────────────────────────────────────────────────────────────────

export function useBroadcast() {
  return useMutation({
    mutationFn: ({ message, actionLink }: { message: string; actionLink?: string }) =>
      broadcastNotification(message, actionLink),
  })
}

// re-export types for convenience
export type { AdminUser, AdminTrack }

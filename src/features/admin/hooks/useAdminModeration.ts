'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { suspendUser, restoreUser, hideTrack, restoreTrack } from '../api/adminApi'

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

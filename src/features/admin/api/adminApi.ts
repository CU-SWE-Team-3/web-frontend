// ─── Admin API — Module 11 ────────────────────────────────────────────────────
// All calls map 1:1 to endpoints in soundcloud-423-biobeats-api-1.07.yaml
// Auth: Bearer token (sent automatically by apiClient interceptor)

import apiClient from '@/shared/api/client'
import type { ReportData, DashboardStats } from '@/shared/types'

// ─── Reports ─────────────────────────────────────────────────────────────────

/** GET /admin/reports — fetches all pending/resolved reports (admin only) */
export async function getReports(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get('/admin/reports', { params })
  // Response shape: { success, results, data: ReportData[] }
  return res.data as { success: boolean; results: number; data: ReportData[] }
}

/** POST /admin/reports — submit a new content report (any logged-in user) */
export async function submitReport(payload: {
  targetType: 'Track' | 'Comment' | 'User'
  targetId: string
  reason: 'Copyright' | 'Inappropriate Content' | 'Spam' | 'Other'
}) {
  const res = await apiClient.post('/admin/reports', payload)
  return res.data as { success: boolean; message: string; data: ReportData }
}

/** PATCH /admin/reports/{id}/status — update report status (admin only) */
export async function updateReportStatus(
  id: string,
  status: 'Pending' | 'Reviewed' | 'Resolved'
) {
  const res = await apiClient.patch(`/admin/reports/${id}/status`, { status })
  return res.data as { success: boolean; message: string; data: ReportData }
}

// ─── Platform Analytics ───────────────────────────────────────────────────────

/** GET /admin/stats — fetch platform health metrics (admin only) */
export async function getDashboardStats() {
  const res = await apiClient.get('/admin/stats')
  // Response: { success, data: DashboardStats }
  return res.data?.data as DashboardStats
}

// ─── User Moderation ─────────────────────────────────────────────────────────

/** PATCH /admin/users/{id}/suspend — suspend a user account (admin only) */
export async function suspendUser(id: string) {
  const res = await apiClient.patch(`/admin/users/${id}/suspend`)
  return res.data as { success: boolean; message: string; data: { userId: string; status: string } }
}

/** PATCH /admin/users/{id}/restore — restore a suspended user (admin only) */
export async function restoreUser(id: string) {
  const res = await apiClient.patch(`/admin/users/${id}/restore`)
  return res.data as { success: boolean; message: string; data: { userId: string; status: string } }
}

// ─── Track Moderation ─────────────────────────────────────────────────────────

/** PATCH /admin/tracks/{id}/hide — hide a track (admin only) */
export async function hideTrack(id: string) {
  const res = await apiClient.patch(`/admin/tracks/${id}/hide`)
  return res.data as { success: boolean; message: string; data: { trackId: string; isPublic: boolean; moderationStatus: string } }
}

/** PATCH /admin/tracks/{id}/restore — restore a hidden track (admin only) */
export async function restoreTrack(id: string) {
  const res = await apiClient.patch(`/admin/tracks/${id}/restore`)
  return res.data as { success: boolean; message: string; data: { trackId: string; isPublic: boolean; moderationStatus: string } }
}

// ─── Track Search (reuses existing /tracks endpoint) ─────────────────────────

/** GET /tracks — search/list tracks for content management panel */
export async function searchTracks(query?: string, page = 1, limit = 20) {
  const res = await apiClient.get('/tracks', { params: { search: query, page, limit } })
  const tracks = res.data?.data?.tracks ?? res.data?.data ?? res.data?.tracks ?? []
  return tracks as Array<{
    _id: string
    title: string
    permalink: string
    artworkUrl?: string
    duration?: number
    playCount?: number
    isPublic?: boolean
    moderationStatus?: string
    artist?: { _id: string; displayName: string; permalink: string; avatarUrl?: string }
    createdAt?: string
  }>
}

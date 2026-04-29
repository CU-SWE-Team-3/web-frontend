// ─── Admin API — Module 11 ────────────────────────────────────────────────────
// All calls map 1:1 to endpoints in soundcloud-423-biobeats-api-1.10-unresolved.yaml
// Auth: Bearer token (sent automatically by apiClient interceptor)

import apiClient from '@/shared/api/client'
import type { ReportData, DashboardStats } from '@/shared/types'

// ─── Reports ─────────────────────────────────────────────────────────────────

/** GET /admin/reports — fetches all pending/resolved reports (admin only) */
export async function getReports(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get('/admin/reports', { params })
  const payload = res.data
  const reports = extractReports(payload)
  return {
    ...payload,
    results: payload?.results ?? payload?.total ?? reports.length,
    data: reports,
  } as { success: boolean; results: number; data: ReportData[] }
}

function extractReports(payload: any): ReportData[] {
  const candidates = [
    payload?.data,
    payload?.data?.reports,
    payload?.data?.docs,
    payload?.data?.items,
    payload?.reports,
    payload?.docs,
    payload?.items,
  ]

  return candidates.find(Array.isArray) ?? []
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

/** GET /admin/stats/daily-users — time-series of daily active users (admin only)
 *  Returns: { success, data: { date: string, activeUsers: number }[] }
 */
export async function getDailyActiveUsers(days = 30) {
  const res = await apiClient.get('/admin/stats/daily-users', { params: { days } })
  return res.data?.data as Array<{ date: string; activeUsers: number }>
}

/** GET /admin/stats/top-tracks — top N tracks by play count (admin only)
 *  Returns: { success, data: { name: string, plays: number }[] }
 */
export async function getTopTracks(limit = 10) {
  const res = await apiClient.get('/admin/stats/top-tracks', { params: { limit } })
  return res.data?.data as Array<{ name: string; plays: number }>
}

// ─── User Moderation ─────────────────────────────────────────────────────────

/** GET /admin/users — list all users with search/filter (admin only)
 *  Response: { success, total, pages, data: AdminUser[] }
 */
export async function getAdminUsers(params?: {
  page?: number
  limit?: number
  search?: string
  status?: 'Active' | 'Suspended' | 'Deleted'
}) {
  const res = await apiClient.get('/admin/users', { params })
  const payload = res.data
  const users = extractAdminUsers(payload)
  return {
    ...payload,
    total: payload?.total ?? payload?.results ?? users.length,
    data: users,
  } as {
    success: boolean
    total: number
    pages: number
    data: AdminUser[]
  }
}

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

/** POST /admin/users/{id}/warn — send official warning via in-app + email (admin only) */
export async function warnUser(id: string, message: string) {
  const res = await apiClient.post(`/admin/users/${id}/warn`, { message })
  return res.data as { success: boolean; message: string }
}

// ─── Track Moderation ─────────────────────────────────────────────────────────

/** GET /admin/tracks — list ALL tracks including hidden/draft (admin only)
 *  Response: { success, total, pages, data: AdminTrack[] }
 */
export async function getAdminTracks(params?: {
  page?: number
  limit?: number
  search?: string
  genre?: string
  status?: 'Published' | 'Draft'
  uploadDate?: 'All Time' | '7days' | '30days'
}) {
  const res = await apiClient.get('/admin/tracks', { params })
  const payload = res.data
  const tracks = extractAdminTracks(payload)
  return {
    ...payload,
    total: payload?.total ?? payload?.results ?? tracks.length,
    data: tracks,
  } as {
    success: boolean
    total: number
    pages: number
    data: AdminTrack[]
  }
}

function extractAdminUsers(payload: any): AdminUser[] {
  const candidates = [
    payload?.data,
    payload?.data?.users,
    payload?.data?.docs,
    payload?.data?.items,
    payload?.users,
    payload?.docs,
    payload?.items,
  ]

  return candidates.find(Array.isArray) ?? []
}

function extractAdminTracks(payload: any): AdminTrack[] {
  const candidates = [
    payload?.data,
    payload?.data?.tracks,
    payload?.data?.docs,
    payload?.data?.items,
    payload?.tracks,
    payload?.docs,
    payload?.items,
  ]

  return candidates.find(Array.isArray) ?? []
}

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

// ─── Broadcast ───────────────────────────────────────────────────────────────

/** POST /admin/broadcast — send system notification to ALL users (admin only) */
export async function broadcastNotification(message: string, actionLink?: string) {
  const res = await apiClient.post('/admin/broadcast', { message, actionLink })
  return res.data as { success: boolean; message: string }
}

// ─── Track Search (fallback — reuses existing /tracks endpoint) ───────────────

/** GET /tracks — search/list tracks (fallback for non-admin contexts) */
export async function searchTracks(query?: string, page = 1, limit = 20) {
  const res = await apiClient.get('/tracks', { params: { search: query, page, limit } })
  const tracks = res.data?.data?.tracks ?? res.data?.data ?? res.data?.tracks ?? []
  return tracks as AdminTrack[]
}

// ─── Shared Admin Types ───────────────────────────────────────────────────────

export interface AdminTrack {
  _id: string
  title: string
  permalink: string
  artworkUrl?: string
  duration?: number
  playCount?: number
  isPublic?: boolean
  moderationStatus?: string
  processingState?: string
  genre?: string
  artist?: { _id: string; displayName: string; permalink: string; avatarUrl?: string }
  createdAt?: string
}

export interface AdminUser {
  _id: string
  displayName: string
  permalink: string
  email: string
  role: string
  accountStatus: 'Active' | 'Suspended' | 'Deleted'
  isPremium: boolean
  followerCount: number
  followingCount: number
  avatarUrl?: string
  createdAt?: string
}

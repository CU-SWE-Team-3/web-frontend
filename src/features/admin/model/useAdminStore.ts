'use client'

import { create } from 'zustand'

export type AdminPanel = 'reports' | 'content' | 'health'
export type ReportFilter = { type: string; status: string }

interface AdminStore {
  activePanel: AdminPanel
  sidebarCollapsed: boolean
  reportFilter: ReportFilter
  pendingReportCount: number

  setActivePanel: (p: AdminPanel) => void
  setSidebarCollapsed: (v: boolean) => void
  setReportFilter: (f: Partial<ReportFilter>) => void
  setPendingReportCount: (n: number) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  activePanel: 'reports',
  sidebarCollapsed: false,
  reportFilter: { type: 'all', status: 'all' },
  pendingReportCount: 0,

  setActivePanel: (p) => set({ activePanel: p }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setReportFilter: (f) =>
    set((s) => ({ reportFilter: { ...s.reportFilter, ...f } })),
  setPendingReportCount: (n) => set({ pendingReportCount: n }),
}))

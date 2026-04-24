'use client'

import { useState, useMemo } from 'react'
import { useAdminReports, useUpdateReportStatus } from '../../hooks/useAdminReports'
import { AdminTable } from '../components/AdminTable'
import { ConfirmModal } from '../components/ConfirmModal'
import { AdminModal } from '../components/AdminModal'
import { showAdminToast } from '../components/AdminToast'
import type { ReportData } from '@/shared/types'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const HEADER_ROW = [
  { key: 'reporter', label: 'Reporter' },
  { key: 'reason', label: 'Reason' },
  { key: 'target', label: 'Reported Item' },
  { key: 'date', label: 'Timestamp' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', width: '260px' },
]

const STATUS_COLOR: Record<string, string> = {
  Urgent: '#ef4444',
  Pending: '#f59e0b',
  Resolved: '#22c55e',
}

export default function ReportsPanel() {
  const { data, isLoading } = useAdminReports()
  const updateStatus = useUpdateReportStatus()

  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmAction, setConfirmAction] = useState<{
    report: ReportData; action: 'Resolved' | 'Pending'
  } | null>(null)
  const [viewReport, setViewReport] = useState<ReportData | null>(null)

  const reports: ReportData[] = data?.data ?? []

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchType = typeFilter === 'all' || r.targetType === typeFilter
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchType && matchStatus
    })
  }, [reports, typeFilter, statusFilter])

  const pendingCount = reports.filter((r) => r.status === 'Pending').length

  const handleAction = async () => {
    if (!confirmAction) return
    try {
      await updateStatus.mutateAsync({ id: confirmAction.report._id, status: confirmAction.action })
      showAdminToast(
        confirmAction.action === 'Resolved'
          ? 'Report marked as Resolved ✓'
          : 'Report dismissed',
        confirmAction.action === 'Resolved' ? 'success' : 'info'
      )
    } catch {
      showAdminToast('Action failed — please try again', 'error')
    } finally {
      setConfirmAction(null)
    }
  }

  const reporterName = (r: ReportData) =>
    typeof r.reporter === 'object' ? r.reporter.displayName : r.reporter ?? 'Unknown'

  return (
    <div>
      {/* Top 3 Donut Charts */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#eee', margin: 0 }}>Reports Overview</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <DonutCard title="Copyright Reports" count={16} color="#ff5500" />
        <DonutCard title="Harassment Reports" count={10} color="#eab308" />
        <DonutCard title="Spam Reports" count={3} color="#a855f7" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#eee', margin: 0, marginRight: 'auto' }}>Reported Items</h2>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={selectStyle}
          aria-label="Filter by type"
          id="report-type-filter"
        >
          <option value="all">All Types</option>
          <option value="Track">Track</option>
          <option value="Comment">Comment</option>
          <option value="User">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
          aria-label="Filter by status"
          id="report-status-filter"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Urgent">Urgent</option>
          <option value="Resolved">Resolved</option>
        </select>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }}
            width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input type="search" placeholder="Search reports..." style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: 6,
            color: '#ccc', padding: '0.55rem 1rem 0.55rem 2.25rem',
            fontSize: '0.8rem', outline: 'none', width: 200,
          }} />
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={HEADER_ROW}
        data={filtered}
        isLoading={isLoading}
        getId={(r) => r._id}
        emptyMessage="No reports match your filters."
        renderRow={(report: ReportData) => (
          <tr
            key={report._id}
            style={{
              borderBottom: '1px solid #1e1e1e',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1f1f1f')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <td style={td}>{reporterName(report)}</td>
            <td style={{ ...td, color: '#ccc' }}>{report.reason}</td>
            <td style={{ ...td, color: '#aaa' }}>{report.targetType}: "{report.targetId?.slice(0, 12)}…"</td>
            <td style={{ ...td, color: '#999', fontSize: '0.8rem' }}>
              {new Date(report.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </td>
            <td style={td}>
              <span style={{
                padding: '4px 10px', borderRadius: 6,
                background: `${STATUS_COLOR[report.status] ?? '#f59e0b'}22`,
                color: STATUS_COLOR[report.status] ?? '#f59e0b',
                fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${STATUS_COLOR[report.status] ?? '#f59e0b'}44`
              }}>
                {report.status}
              </span>
            </td>
            <td style={td}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionBtn label="Dismiss" onClick={() => {}} color="#666" id={`dismiss-${report._id}`} />
                <ActionBtn label="Warn User" onClick={() => {}} color="#888" id={`warn-${report._id}`} />
                <ActionBtn label="Remove Content" onClick={() => {}} color="#888" id={`remove-${report._id}`} />
              </div>
            </td>
          </tr>
        )}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        isLoading={updateStatus.isPending}
        isDanger={confirmAction?.action !== 'Resolved'}
        title={confirmAction?.action === 'Resolved' ? 'Mark as Resolved' : 'Dismiss Report'}
        confirmLabel={confirmAction?.action === 'Resolved' ? 'Mark Resolved' : 'Dismiss'}
        message={
          confirmAction?.action === 'Resolved'
            ? `Mark this ${confirmAction.report.targetType} report as Resolved? This will close the report.`
            : 'Dismiss this report and set it back to Pending?'
        }
      />

      {/* View Content Drawer */}
      <AdminModal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        title="Report Details"
        size="md"
      >
        {viewReport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Reporter" value={reporterName(viewReport)} />
            <Field label="Target Type" value={viewReport.targetType} />
            <Field label="Target ID" value={viewReport.targetId} mono />
            <Field label="Reason" value={viewReport.reason} />
            <Field label="Status" value={viewReport.status} />
            <Field label="Submitted" value={new Date(viewReport.createdAt).toLocaleString()} />
          </div>
        )}
      </AdminModal>
    </div>
  )
}

/* ─── Small helpers ─────────────────────────────────────────────────────── */

function DonutCard({ title, count, color }: { title: string; count: number; color: string }) {
  const data = [{ value: count, color }, { value: 20 - count, color: '#222' }]
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #333', borderRadius: 8,
      padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ color: '#eee', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</div>
      <div style={{ width: 120, height: 120, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{count}</span>
          <span style={{ color: '#666', fontSize: '0.6rem' }}>outs</span>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ label, onClick, color, id }: {
  label: string; onClick: () => void; color: string; id: string
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        padding: '0.4rem 0.8rem', borderRadius: 6, border: `1px solid #333`,
        background: 'transparent', color: '#ccc', fontSize: '0.75rem', fontWeight: 500,
        cursor: 'pointer', transition: 'all 150ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#333' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {label}
    </button>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase',
        letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: '#ccc', fontSize: '0.875rem', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value}
      </div>
    </div>
  )
}

const td: React.CSSProperties = { padding: '0.85rem 1rem', color: '#ccc', verticalAlign: 'middle' }
const selectStyle: React.CSSProperties = {
  background: 'transparent', border: '1px solid #333', borderRadius: 6,
  color: '#aaa', padding: '0.55rem 1rem', fontSize: '0.8rem', cursor: 'pointer',
  outline: 'none',
}

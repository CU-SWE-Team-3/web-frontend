'use client'

import { type FC } from 'react'

interface SkeletonRowProps { cols?: number }

export const SkeletonRow: FC<SkeletonRowProps> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '0.85rem 1rem' }}>
        <div style={{
          height: 14, borderRadius: 4,
          background: 'linear-gradient(90deg, #222 25%, #2a2a2a 50%, #222 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          width: i === 0 ? '60%' : i === cols - 1 ? '40%' : '80%',
        }} />
      </td>
    ))}
    <style>{`@keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }`}</style>
  </tr>
)

interface AdminTableProps<T> {
  columns: { key: string; label: string; width?: string }[]
  data: T[]
  isLoading?: boolean
  skeletonRows?: number
  renderRow: (item: T, index: number) => React.ReactNode
  selectedIds?: Set<string>
  onSelectAll?: (checked: boolean) => void
  getId?: (item: T) => string
  emptyMessage?: string
}

export function AdminTable<T>({
  columns, data, isLoading = false, skeletonRows = 6,
  renderRow, selectedIds, onSelectAll, getId, emptyMessage = 'No data found.'
}: AdminTableProps<T>) {
  const allSelected = data.length > 0 && getId
    ? data.every((item) => selectedIds?.has(getId(item)))
    : false

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 10, overflow: 'hidden',
      border: '1px solid #2a2a2a',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ background: '#111', borderBottom: '1px solid #2a2a2a' }}>
              {selectedIds && onSelectAll && (
                <th style={{ width: 40, padding: '0.75rem 1rem', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    style={{ accentColor: '#ff5500', cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} style={{
                  padding: '0.75rem 1rem', textAlign: 'left',
                  color: '#666', fontWeight: 600, letterSpacing: '0.04em',
                  textTransform: 'uppercase', fontSize: '0.7rem',
                  width: col.width,
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length + (selectedIds ? 1 : 0)} />
                ))
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length + (selectedIds ? 1 : 0)}
                    style={{ padding: '3rem', textAlign: 'center', color: '#555' }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((item, index) => renderRow(item, index))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

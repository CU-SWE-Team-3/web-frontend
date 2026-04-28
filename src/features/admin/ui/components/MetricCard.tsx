'use client'

import { type FC } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  icon: string
  sub?: string
  accent?: string
  isLoading?: boolean
}

export const MetricCard: FC<MetricCardProps> = ({
  label, value, icon, sub, accent = '#ff5500', isLoading
}) => (
  <div style={{
    background: 'linear-gradient(180deg, #1c1c1c 0%, #151515 100%)',
    border: '1px solid #2a2a2a',
    borderTop: `2px solid ${accent}`,
    borderRadius: 8, padding: '1.25rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  }}>
    <div style={{
      color: '#888', fontSize: '0.7rem', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {label}
    </div>
    {isLoading ? (
      <div style={{
        height: 32, width: '60%', borderRadius: 4, marginTop: 4,
        background: 'linear-gradient(90deg, #222 25%, #2a2a2a 50%, #222 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
      }} />
    ) : (
      <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </div>
    )}
    {sub && !isLoading && (
      <div style={{ color: '#555', fontSize: '0.75rem', marginTop: 2 }}>{sub}</div>
    )}
    <style>{`@keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }`}</style>
  </div>
)

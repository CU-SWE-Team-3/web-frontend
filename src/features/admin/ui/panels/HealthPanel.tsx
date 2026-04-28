'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useAdminStats, useDailyActiveUsers, useTopTracks } from '../../hooks/useAdminStats'
import { MetricCard } from '../components/MetricCard'

const CHART_COLORS = { line: '#ff5500', bar: '#ff5500', grid: '#1e1e1e', text: '#555' }

export default function HealthPanel() {
  const { data: stats, isLoading, dataUpdatedAt } = useAdminStats()
  const { data: dailyUsers = [], isLoading: chartLoading } = useDailyActiveUsers(30)
  const { data: topTracks = [], isLoading: topLoading } = useTopTracks(10)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  useEffect(() => {
    if (dataUpdatedAt) setLastRefreshed(new Date(dataUpdatedAt))
  }, [dataUpdatedAt])

  return (
    <div>
      {/* Auto-refresh indicator */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        gap: '0.5rem', marginBottom: '1rem', color: '#444', fontSize: '0.75rem',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
          animation: 'pulse 2s infinite',
        }} />
        Auto-refresh every 60s · Last: {lastRefreshed.toLocaleTimeString()}
        <style>{`@keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }`}</style>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        <MetricCard
          label="Total Active Users"
          value={stats?.totalUsers?.toLocaleString() ?? '—'}
          icon="👥"
          sub={`Artists: ${stats?.roleBreakdown?.artists ?? 0} · Listeners: ${stats?.roleBreakdown?.listeners ?? 0}`}
          accent="#ff5500"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total Tracks"
          value={stats?.totalTracks?.toLocaleString() ?? '—'}
          icon="🎵"
          sub={`${stats?.totalPlays?.toLocaleString() ?? 0} total plays`}
          accent="#3b82f6"
          isLoading={isLoading}
        />
        <MetricCard
          label="Revenue"
          value="$85.4K"
          icon=""
          accent="#8b5cf6"
          isLoading={isLoading}
        />
        <MetricCard
          label="Active Subscriptions"
          value="250K"
          icon=""
          accent="#3b82f6"
          isLoading={isLoading}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Area Chart — Daily Active Users */}
        <ChartCard title="Daily Active Users (30 Days)" isLoading={chartLoading}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyUsers} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.line} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.line} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                tickLine={false} axisLine={false}
                interval={4}
              />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#aaa', fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke={CHART_COLORS.line}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUsers)"
                activeDot={{ r: 5, fill: '#ff5500', stroke: '#111', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>


      {/* ── Bar Chart — Top Tracks ────────────────────────────────────── */}
      <ChartCard title="Top 10 Tracks by Play Count" isLoading={topLoading}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topTracks} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} horizontal={true} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
              tickLine={false} axisLine={false}
            />
            <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="plays" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function ChartCard({ title, children, isLoading }: {
  title: string; children: React.ReactNode; isLoading: boolean
}) {
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #2a2a2a',
      borderRadius: 12, padding: '1.25rem',
    }}>
      <div style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: 600,
        marginBottom: '1rem', letterSpacing: '0.03em' }}>
        {title}
      </div>
      {isLoading ? (
        <div style={{
          height: 220, borderRadius: 8,
          background: 'linear-gradient(90deg, #1e1e1e 25%, #222 50%, #1e1e1e 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      ) : children}
      <style>{`@keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
      }`}</style>
    </div>
  )
}

const tooltipStyle: React.CSSProperties = {
  background: '#111', border: '1px solid #2a2a2a',
  borderRadius: 6, color: '#ccc', fontSize: '0.8rem',
}

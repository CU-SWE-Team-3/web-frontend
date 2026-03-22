import { type FC } from 'react';
import s from './StatCounter.module.scss';

export interface StatItem {
  label: string;
  value: string | number;
}

export interface StatCounterProps {
  stats: StatItem[];
  className?: string;
}

function formatStat(v: string | number): string {
  if (typeof v === 'string') return v;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

export const StatCounter: FC<StatCounterProps> = ({ stats, className }) => (
  <div className={[s.row, className].filter(Boolean).join(' ')}>
    {stats.map((stat) => (
      <div key={stat.label} className={s.counter} data-testid={`stat-counter-${stat.label.toLowerCase()}`}>
        <span className={s.label}>{stat.label}</span>
        <span className={s.value} data-testid={`stat-counter-value-${stat.label.toLowerCase()}`}>{formatStat(stat.value)}</span>
      </div>
    ))}
  </div>
);

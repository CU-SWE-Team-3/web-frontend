/** Format seconds → "m:ss" */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Generate organic-looking waveform amplitude data (0–1) */
export function generateWaveformData(length: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    const base = 0.3 + 0.2 * Math.sin(i * 0.05);
    const noise = 0.3 * Math.sin(i * 0.2) * Math.cos(i * 0.13);
    const peak = 0.2 * Math.sin(i * 0.01);
    data.push(clamp(base + noise + peak, 0.05, 1));
  }
  return data;
}

/** Format ISO date string to human-readable relative time */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

'use client'

import { DevActivityData } from './useDevActivity'

interface Props {
  momentum: DevActivityData['momentum']
  loading: boolean
}

const stats: {
  key: keyof DevActivityData['momentum']
  label: string
  color: string
}[] = [
  { key: 'commitsThisWeek', label: 'Commits this week', color: 'var(--neon-purple)' },
  { key: 'deploysThisWeek', label: 'Deploys this week', color: 'var(--neon-blue)' },
  { key: 'activeRepos',     label: 'Active repos',      color: 'var(--neon-green)' },
  { key: 'failedDeploys',   label: 'Failed deploys',    color: 'var(--neon-pink)' },
]

export default function MomentumSummary({ momentum, loading }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
    }}>
      {stats.map(({ key, label, color }) => (
        <div
          key={key}
          className="card"
          style={{ borderColor: `${color}22` }}
        >
          <div style={{
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color,
            lineHeight: 1,
            marginBottom: '8px',
            textShadow: `0 0 20px ${color}33`,
            animation: loading ? 'neon-pulse 1.5s ease-in-out infinite' : 'none',
          }}>
            {loading ? '--' : String(momentum[key]).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

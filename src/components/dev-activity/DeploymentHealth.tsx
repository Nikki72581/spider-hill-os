'use client'

import { DeploymentItem } from './useDevActivity'

interface Props {
  deployments: DeploymentItem[]
  loading: boolean
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const statusConfig: Record<
  DeploymentItem['status'],
  { pillClass: string; label: string; borderColor: string }
> = {
  ready:    { pillClass: 'pill-done',         label: 'ready',    borderColor: 'var(--neon-green)' },
  building: { pillClass: 'pill-in-progress',  label: 'building', borderColor: 'var(--neon-blue)' },
  error:    { pillClass: 'pill-urgent',        label: 'error',    borderColor: 'var(--neon-pink)' },
  queued:   { pillClass: 'pill-open',          label: 'queued',   borderColor: 'var(--border-mid)' },
}

export default function DeploymentHealth({ deployments, loading }: Props) {
  return (
    <div>
      <h2 style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-display)',
        marginBottom: '14px',
      }}>
        ◈ Deployment Health
      </h2>

      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '8px',
        }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="card"
              style={{ padding: '12px 16px', opacity: 0.35, animation: 'neon-pulse 1.5s ease-in-out infinite' }}
            >
              <div style={{ height: '14px', background: 'var(--bg-overlay)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '10px', background: 'var(--bg-overlay)', borderRadius: '4px', width: '55%' }} />
            </div>
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          No Vercel projects found. Add VERCEL_TOKEN to .env to enable.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '8px',
        }}>
          {deployments.map(dep => {
            const cfg = statusConfig[dep.status]
            return (
              <div
                key={dep.projectName}
                className="card"
                style={{ padding: '12px 16px', borderLeft: `2px solid ${cfg.borderColor}` }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '6px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {dep.projectName}
                  </span>
                  <span className={`pill ${cfg.pillClass}`} style={{ flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {relativeTime(dep.lastDeployAt)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {dep.branch}
                  </span>
                  {dep.buildDuration !== undefined && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                      {dep.buildDuration}s
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

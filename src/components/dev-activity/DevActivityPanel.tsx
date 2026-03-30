'use client'

import { useDevActivity } from './useDevActivity'
import MomentumSummary from './MomentumSummary'
import DeploymentHealth from './DeploymentHealth'
import UnifiedActivityFeed from './UnifiedActivityFeed'

const emptyMomentum = { commitsThisWeek: 0, deploysThisWeek: 0, activeRepos: 0, failedDeploys: 0 }

export default function DevActivityPanel() {
  const { data, loading, error } = useDevActivity()

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{
            fontWeight: 800,
            fontSize: '28px',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            Dev Activity
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            GitHub + Vercel — real-time developer dashboard
          </p>
        </div>
        {error && (
          <span className="pill pill-urgent" style={{ marginTop: '8px' }}>
            refresh failed
          </span>
        )}
      </div>

      {/* Momentum stats */}
      <div style={{ marginBottom: '24px' }}>
        <MomentumSummary
          momentum={data?.momentum ?? emptyMomentum}
          loading={loading}
        />
      </div>

      {/* Deployments + Feed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '16px',
        alignItems: 'start',
      }}>
        <div className="card">
          <DeploymentHealth
            deployments={data?.deployments ?? []}
            loading={loading}
          />
        </div>

        <div className="card">
          <UnifiedActivityFeed
            feed={data?.feed ?? []}
            loading={loading}
            lastRefreshed={data?.lastRefreshed ?? ''}
          />
        </div>
      </div>
    </div>
  )
}

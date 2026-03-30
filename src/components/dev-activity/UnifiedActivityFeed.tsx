'use client'

import { FeedItem as FeedItemType } from './useDevActivity'
import FeedItem from './FeedItem'

interface Props {
  feed: FeedItemType[]
  loading: boolean
  lastRefreshed: string
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

export default function UnifiedActivityFeed({ feed, loading, lastRefreshed }: Props) {
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
        ⬡ Activity Feed
      </h2>

      <div style={{
        maxHeight: '480px',
        overflowY: 'auto',
        borderLeft: '1px solid var(--border-subtle)',
        paddingLeft: '12px',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ opacity: 0.3, animation: 'neon-pulse 1.5s ease-in-out infinite' }}>
                <div style={{ height: '12px', background: 'var(--bg-overlay)', borderRadius: '4px', marginBottom: '5px', width: '75%' }} />
                <div style={{ height: '10px', background: 'var(--bg-overlay)', borderRadius: '4px', width: '40%' }} />
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '8px 0' }}>
            No recent activity found.
          </p>
        ) : (
          feed.map(item => <FeedItem key={item.id} item={item} />)
        )}
      </div>

      {lastRefreshed && (
        <div style={{
          marginTop: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--neon-green)',
            display: 'inline-block',
            animation: 'neon-pulse 2s ease-in-out infinite',
          }} />
          Last refreshed {relativeTime(lastRefreshed)}
        </div>
      )}
    </div>
  )
}

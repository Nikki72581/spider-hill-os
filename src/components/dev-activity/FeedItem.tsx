'use client'

import { FeedItem as FeedItemType } from './useDevActivity'

interface Props {
  item: FeedItemType
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

// Renders action string — wraps `backtick` text in code style
function ActionText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                background: 'var(--bg-overlay)',
                padding: '1px 4px',
                borderRadius: '3px',
              }}
            >
              {part.slice(1, -1)}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

export default function FeedItem({ item }: Props) {
  const isGitHub = item.source === 'github'
  const dotColor = isGitHub ? 'var(--neon-purple)' : 'var(--neon-blue)'
  const commits = item.details.commits as Array<{ sha: string; message: string }> | undefined
  const commitMessage = item.details.commitMessage as string | undefined

  return (
    <div
      className="animate-in"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '10px 0',
        borderBottom: '0.5px solid var(--border-subtle)',
      }}
    >
      {/* Timeline dot */}
      <div style={{ paddingTop: '4px', flexShrink: 0 }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 8px ${dotColor}55`,
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: isGitHub && commits?.length ? '5px' : 0,
          flexWrap: 'wrap',
        }}>
          <span className={`tag ${isGitHub ? 'tag-personal' : 'tag-work'}`} style={{ flexShrink: 0 }}>
            {isGitHub ? 'github' : 'vercel'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>
            <ActionText text={item.action} />
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            flexShrink: 0,
            paddingTop: '2px',
          }}>
            {relativeTime(item.timestamp)}
          </span>
        </div>

        {/* GitHub commit list */}
        {isGitHub && commits && commits.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {commits.map(commit => (
              <div key={commit.sha} style={{
                display: 'flex',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                overflow: 'hidden',
              }}>
                <span style={{ color: 'var(--neon-purple)', flexShrink: 0 }}>{commit.sha}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {commit.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Vercel commit message */}
        {!isGitHub && commitMessage && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: '3px',
          }}>
            {commitMessage}
          </div>
        )}
      </div>
    </div>
  )
}

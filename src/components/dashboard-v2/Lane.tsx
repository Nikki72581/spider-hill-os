'use client'
import type { Task, TaskBucket } from '@prisma/client'
import Link from 'next/link'

const laneStyle: Record<TaskBucket, { color: string; label: string; glyph: string }> = {
  NOW:   { color: 'var(--pip-red, #FF3333)',   label: 'NOW',   glyph: '▶' },
  NEXT:  { color: 'var(--pip-amber, #FFB000)', label: 'NEXT',  glyph: '●' },
  LATER: { color: 'var(--text-secondary)',      label: 'LATER', glyph: '∙' },
}

const catClass: Record<string, string> = {
  WORK: 'tag-work', HOME: 'tag-home', WRITING: 'tag-writing', PERSONAL: 'tag-personal',
}

export default function Lane({ bucket, tasks }: { bucket: TaskBucket; tasks: Task[] }) {
  const s = laneStyle[bucket]
  const totalMin = tasks.reduce((a, t) => a + (t.minutes ?? 0), 0)
  const isNow = bucket === 'NOW'

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <header style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${isNow ? 'rgba(255,51,51,0.35)' : 'var(--border-subtle)'}`,
        background: isNow ? 'rgba(255,51,51,0.04)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
        color: s.color,
      }}>
        <span>{s.glyph} {s.label}</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-vt)', fontSize: 18, color: s.color }}>
            {String(tasks.length).padStart(2, '0')}
          </span>
          <span style={{ color: 'var(--text-ghost)', fontSize: 9 }}>
            {totalMin ? `≈${totalMin >= 60 ? Math.round(totalMin/60*10)/10 + 'h' : totalMin + 'm'}` : ''}
          </span>
        </span>
      </header>
      <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto' }}>
        {tasks.map(t => (
          <Link key={t.id} href={`/tasks/${t.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px',
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--text-primary)', textDecoration: 'none',
            borderLeft: isNow ? '2px solid var(--pip-red, #FF3333)' : '2px solid transparent',
            background: isNow ? 'rgba(255,51,51,0.05)' : 'transparent',
          }}>
            <span style={{
              width: 12, height: 12,
              border: `1px solid ${isNow ? 'var(--pip-red, #FF3333)' : 'var(--border-mid)'}`,
              flexShrink: 0,
            }} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.title}
            </span>
            <span style={{ display: 'inline-flex', gap: 2, flexShrink: 0 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 4, height: 4,
                  background: i < t.energy ? 'var(--pip-green, #0CFF70)' : 'var(--border-mid)',
                  boxShadow: i < t.energy ? '0 0 4px rgba(12,255,112,0.6)' : 'none',
                }} />
              ))}
            </span>
            <span className={`tag ${catClass[t.category]}`}>{t.category.toLowerCase()}</span>
            {t.minutes && (
              <span style={{ fontSize: 10, color: 'var(--text-ghost)', minWidth: 28, textAlign: 'right' }}>
                {t.minutes}m
              </span>
            )}
          </Link>
        ))}
        {tasks.length === 0 && (
          <div style={{ padding: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {isNow ? 'all clear. breathe.' : 'empty.'}
          </div>
        )}
      </div>
    </div>
  )
}

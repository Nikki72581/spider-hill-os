'use client'
import type { Task } from '@prisma/client'
import Link from 'next/link'

const catClass: Record<string, string> = {
  WORK: 'tag-work', HOME: 'tag-home', WRITING: 'tag-writing', PERSONAL: 'tag-personal',
}

export default function OneThingCard({ task }: { task: Task | null }) {
  if (!task) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ color: 'var(--text-muted)' }}>queue clear. take a break.</div>
      </div>
    )
  }
  return (
    <div className="card" style={{
      padding: 14, display: 'flex', flexDirection: 'column',
      border: '1px solid rgba(255,51,51,0.4)',
      animation: 'urgent-pulse 2.4s ease-in-out infinite',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pip-red, #FF3333)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
        ■ now · the one thing
      </div>
      <div style={{
        fontFamily: 'var(--font-vt)', fontSize: 19,
        color: 'var(--pip-bright, #4AFF91)',
        lineHeight: 1.15, letterSpacing: '0.02em',
        textShadow: '0 0 10px rgba(74,255,145,0.5)',
        textTransform: 'uppercase',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {task.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span className={`tag ${catClass[task.category]}`}>{task.category.toLowerCase()}</span>
        {task.minutes && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            ~{task.minutes}m
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
        <Link href={`/focus?task=${task.id}`} style={{
          padding: '5px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
          border: '1px solid rgba(12,255,112,0.4)', color: 'var(--pip-green, #0CFF70)',
          letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
        }}>▶ START</Link>
        <button style={{
          padding: '5px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
          border: '1px solid var(--border-mid)', color: 'var(--text-muted)',
          letterSpacing: '0.08em', background: 'transparent', cursor: 'pointer',
        }}>⇄ SWAP</button>
        <button style={{
          padding: '5px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
          border: '1px solid var(--border-mid)', color: 'var(--text-muted)',
          letterSpacing: '0.08em', background: 'transparent', cursor: 'pointer',
        }}>⏸ DEFER</button>
      </div>
    </div>
  )
}

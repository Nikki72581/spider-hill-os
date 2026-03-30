'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Idea, IdeaStatus } from '@/types'

const statuses: { key: IdeaStatus | 'ALL'; label: string; color: string }[] = [
  { key: 'ALL',        label: 'All',        color: 'var(--text-primary)'  },
  { key: 'RAW',        label: 'Raw',        color: 'var(--text-secondary)' },
  { key: 'DEVELOPING', label: 'Developing', color: 'var(--neon-blue)'     },
  { key: 'READY',      label: 'Ready',      color: 'var(--neon-green)'    },
  { key: 'PARKED',     label: 'Parked',     color: 'var(--text-muted)'    },
]

const statusColor: Record<string, string> = {
  RAW:        'var(--text-secondary)',
  DEVELOPING: 'var(--neon-blue)',
  READY:      'var(--neon-green)',
  PARKED:     'var(--text-muted)',
}

const categoryClass: Record<string, string> = {
  WORK:     'tag-work',
  HOME:     'tag-home',
  WRITING:  'tag-writing',
  PERSONAL: 'tag-personal',
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<IdeaStatus | 'ALL'>('ALL')

  useEffect(() => {
    fetch('/api/ideas')
      .then(r => r.json())
      .then(d => { setIdeas(d); setLoading(false) })
  }, [])

  const visible = filter === 'ALL' ? ideas : ideas.filter(i => i.status === filter)

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '2px' }}>Ideas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            {ideas.filter(i => i.status !== 'PARKED').length} active · {ideas.filter(i => i.status === 'READY').length} ready to develop
          </p>
        </div>
        <Link href="/ideas/new" style={{
          padding: '9px 18px',
          background: 'var(--neon-purple)12',
          border: '0.5px solid var(--neon-purple)44',
          color: 'var(--neon-purple)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          + Capture Idea
        </Link>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {statuses.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            padding: '5px 14px',
            borderRadius: 'var(--radius-sm)',
            background: filter === s.key ? 'var(--bg-overlay)' : 'transparent',
            border: filter === s.key ? `0.5px solid ${s.color}55` : '0.5px solid var(--border-subtle)',
            color: filter === s.key ? s.color : 'var(--text-secondary)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading...</div>
      ) : visible.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          No ideas here. <Link href="/ideas/new" style={{ color: 'var(--neon-purple)' }}>Capture one →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visible.map(idea => (
            <Link key={idea.id} href={`/ideas/${idea.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                transition: 'border-color 0.15s',
                cursor: 'pointer',
              }}>
                {/* Status dot */}
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: statusColor[idea.status], flexShrink: 0,
                }} />

                {/* Title */}
                <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {idea.title}
                </span>

                {/* Linked article indicator */}
                {idea.article && (
                  <span style={{
                    fontSize: '10px', fontFamily: 'var(--font-mono)',
                    color: 'var(--neon-amber)', background: 'var(--neon-amber)10',
                    padding: '2px 8px', borderRadius: '4px',
                    border: '0.5px solid var(--neon-amber)33',
                  }}>
                    → article
                  </span>
                )}

                {/* Category */}
                <span className={`tag ${categoryClass[idea.category]}`}>
                  {idea.category.toLowerCase()}
                </span>

                {/* Status */}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: statusColor[idea.status], letterSpacing: '0.06em',
                  textTransform: 'uppercase', minWidth: '72px', textAlign: 'right',
                }}>
                  {idea.status.toLowerCase()}
                </span>

                {/* Age */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', minWidth: '52px', textAlign: 'right' }}>
                  {Math.floor((Date.now() - new Date(idea.createdAt).getTime()) / 86400000)}d ago
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

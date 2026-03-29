'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { KBEntry, KBDomain } from '@/types'

const domains: { key: KBDomain | 'ALL'; label: string; color: string }[] = [
  { key: 'ALL',      label: 'All',      color: 'var(--text-secondary)' },
  { key: 'TECH',     label: 'Tech',     color: 'var(--neon-cyan)'    },
  { key: 'WORK',     label: 'Work',     color: 'var(--neon-blue)'    },
  { key: 'HOME',     label: 'Home',     color: 'var(--neon-green)'   },
  { key: 'PERSONAL', label: 'Personal', color: 'var(--neon-purple)'  },
]

const domainColor: Record<string, string> = {
  TECH:     'var(--neon-cyan)',
  WORK:     'var(--neon-blue)',
  HOME:     'var(--neon-green)',
  PERSONAL: 'var(--neon-purple)',
}

function KBContent() {
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const [domain, setDomain] = useState<KBDomain | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query)          params.set('q', query)
    if (domain !== 'ALL') params.set('domain', domain)

    const res = await fetch(`/api/kb?${params}`)
    setEntries(await res.json())
    setLoading(false)
  }, [query, domain])

  useEffect(() => {
    const t = setTimeout(fetchEntries, 250)
    return () => clearTimeout(t)
  }, [fetchEntries])

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '2px' }}>
            Knowledge Base
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            {entries.length} entries
          </p>
        </div>
        <Link href="/kb/new" style={{
          padding: '9px 18px',
          background: 'var(--neon-green)12',
          border: '0.5px solid var(--neon-green)44',
          color: 'var(--neon-green)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          + New Entry
        </Link>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px',
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search entries, tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '28px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {domains.map(d => (
            <button
              key={d.key}
              onClick={() => setDomain(d.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: domain === d.key ? 'var(--bg-overlay)' : 'transparent',
                border: domain === d.key ? `0.5px solid ${d.color}55` : '0.5px solid var(--border-subtle)',
                color: domain === d.key ? d.color : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries grid */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '20px 0' }}>
          Loading...
        </div>
      ) : entries.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          {query ? `No results for "${query}"` : 'No entries yet. Start building your knowledge base.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {entries.map(entry => (
            <Link key={entry.id} href={`/kb/${entry.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4 }}>{entry.title}</h3>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: domainColor[entry.domain],
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {entry.domain}
                  </span>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '10px',
                }}>
                  {entry.body.replace(/[#*`]/g, '').slice(0, 200)}
                </p>

                {entry.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {entry.tags.slice(0, 4).map(tag => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-elevated)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '0.5px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}>
                  Updated {new Date(entry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KBPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '20px 0' }}>Loading...</div>}>
      <KBContent />
    </Suspense>
  )
}

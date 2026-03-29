'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Topbar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/kb?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--bg-surface)',
      borderBottom: '0.5px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      gap: '24px',
      flexShrink: 0,
    }}>
      {/* Date */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}>
        {dateStr}
      </div>

      {/* Global search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '360px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            pointerEvents: 'none',
          }}>
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search KB, ideas, articles..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              paddingLeft: '28px',
              height: '32px',
              fontSize: '12px',
            }}
          />
        </div>
      </form>

      {/* Live indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
      }}>
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--neon-green)',
          animation: 'neon-pulse 2.5s ease-in-out infinite',
          display: 'inline-block',
        }} />
        LIVE
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Menu } from 'lucide-react'

interface TopbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export default function Topbar({ onMenuClick, showMenuButton = false }: TopbarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/kb?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--bg-surface)',
      borderBottom: '0.5px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      flexShrink: 0,
    }}>
      {/* Hamburger — mobile only */}
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 shrink-0 text-muted-foreground"
          aria-label="open navigation menu"
        >
          <Menu size={16} />
        </Button>
      )}

      {/* Date — desktop only */}
      {!showMenuButton && (
        <span style={{
          whiteSpace: 'nowrap',
          color: 'var(--text-ghost)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          {dateStr}
        </span>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: showMenuButton ? '100%' : 360 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 9,
              color: 'var(--text-ghost)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search KB, ideas, articles..."
            aria-label="global search"
            className="pl-7 h-8 text-xs bg-transparent border-white/5 focus-visible:ring-1 focus-visible:ring-white/10"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>
      </form>

      {/* O365 auth */}
      {status !== 'loading' && (
        session ? (
          <button
            onClick={() => signOut()}
            title={`Signed in as ${session.user?.email}`}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-mid)',
              color: 'var(--pip-green, #0CFF70)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              padding: '4px 8px',
              cursor: 'pointer',
              flexShrink: 0,
              textTransform: 'uppercase',
            }}
          >
            ◉ O365
          </button>
        ) : (
          <button
            onClick={() => signIn('azure-ad')}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              padding: '4px 8px',
              cursor: 'pointer',
              flexShrink: 0,
              textTransform: 'uppercase',
            }}
          >
            ○ O365
          </button>
        )
      )}

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
        <span style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--neon-green)',
          animation: 'neon-pulse 2.5s ease-in-out infinite',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        {!showMenuButton && (
          <span style={{
            color: 'var(--text-ghost)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
          }}>
            LIVE
          </span>
        )}
      </div>
    </header>
  )
}

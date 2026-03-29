'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Dashboard',  icon: '◈', accent: 'var(--neon-cyan)' },
  { href: '/tasks',     label: 'Tasks',       icon: '◻', accent: 'var(--neon-pink)' },
  { href: '/ideas',     label: 'Ideas',       icon: '◆', accent: 'var(--neon-purple)' },
  { href: '/articles',  label: 'Writing',     icon: '◉', accent: 'var(--neon-amber)' },
  { href: '/kb',        label: 'Knowledge',   icon: '◎', accent: 'var(--neon-green)' },
  { href: '/links',     label: 'Links',        icon: '⬡', accent: 'var(--neon-blue)' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 'var(--sidebar-w)',
      height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '0.5px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 0',
        marginBottom: '28px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          System
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '18px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Spider Hill
          <span style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
            color: 'var(--neon-cyan)',
            letterSpacing: '0.1em',
            marginTop: '-2px',
          }}>
            OS v1.0
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 10px', flex: 1 }}>
        {nav.map(({ href, label, icon, accent }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2px',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: active ? `2px solid ${accent}` : '2px solid transparent',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
            >
              <span style={{
                fontSize: '14px',
                color: active ? accent : 'var(--text-muted)',
                lineHeight: 1,
              }}>
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Quick capture shortcut */}
      <div style={{ padding: '16px 10px 20px' }}>
        <Link href="/capture" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '0.5px solid var(--border-mid)',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          transition: 'all 0.15s',
          textDecoration: 'none',
        }}>
          ⌘ Quick capture
        </Link>
      </div>
    </aside>
  )
}

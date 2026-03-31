'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckCircle2,
  Lightbulb,
  PenLine,
  BookOpen,
  Link2,
  Terminal,
  Home,
  Zap,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const nav: { href: string; label: string; Icon: LucideIcon; accent: string }[] = [
  { href: '/dashboard', label: 'Dashboard',   Icon: LayoutDashboard, accent: '#4cc9f0' },
  { href: '/tasks',     label: 'Tasks',        Icon: CheckCircle2,    accent: '#f72585' },
  { href: '/ideas',     label: 'Ideas',        Icon: Lightbulb,       accent: '#9b5de5' },
  { href: '/articles',  label: 'Writing',      Icon: PenLine,         accent: '#f4a261' },
  { href: '/kb',        label: 'Knowledge',    Icon: BookOpen,        accent: '#06d6a0' },
  { href: '/links',     label: 'Links',        Icon: Link2,           accent: '#4361ee' },
  { href: '/dev',       label: 'Dev Activity', Icon: Terminal,        accent: '#4cc9f0' },
  { href: '/home',      label: 'Home Control', Icon: Home,            accent: '#06d6a0' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

function SidebarContent({
  isMobile,
  onClose,
  pathname,
}: {
  isMobile: boolean
  onClose?: () => void
  pathname: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 0', marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{
            display: 'block',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-ghost)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            System
          </span>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Spider Hill
          </span>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--neon-cyan)',
            letterSpacing: '0.1em',
            marginTop: '-2px',
          }}>
            OS v1.0
          </span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground mt-1 -mr-1"
            aria-label="close menu"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 10px', flex: 1 }}>
        {nav.map(({ href, label, Icon, accent }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `2px solid ${active ? accent : 'transparent'}`,
                background: active ? 'var(--bg-elevated)' : 'transparent',
                marginBottom: '2px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <Icon size={16} style={{ color: active ? accent : 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-2.5 mb-4" style={{ background: 'var(--border-subtle)' }} />

      {/* Quick capture */}
      <div style={{ padding: '0 10px 20px' }}>
        <Link href="/capture" onClick={isMobile ? onClose : undefined} style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border-mid)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-overlay)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)' }}
          >
            <Zap size={12} style={{ color: 'var(--neon-cyan)' }} />
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}>
              Quick capture
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen = false, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => { if (!open) onClose?.() }}>
        <SheetContent
          side="left"
          className="p-0 border-r"
          style={{
            width: 'var(--sidebar-w)',
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <SidebarContent isMobile pathname={pathname} onClose={onClose} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--bg-surface)',
      borderRight: '0.5px solid var(--border-subtle)',
      zIndex: 100,
    }}>
      <SidebarContent isMobile={false} pathname={pathname} />
    </aside>
  )
}

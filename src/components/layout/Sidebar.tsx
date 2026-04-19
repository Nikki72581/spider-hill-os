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
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const nav: { href: string; label: string; Icon: LucideIcon; accent: string }[] = [
  { href: '/dashboard', label: 'Dashboard',   Icon: LayoutDashboard, accent: '#0CFF70' },
  { href: '/tasks',     label: 'Tasks',        Icon: CheckCircle2,    accent: '#FFB000' },
  { href: '/ideas',     label: 'Ideas',        Icon: Lightbulb,       accent: '#0CFF70' },
  { href: '/articles',  label: 'Writing',      Icon: PenLine,         accent: '#FFB000' },
  { href: '/kb',        label: 'Knowledge',    Icon: BookOpen,        accent: '#4AFF91' },
  { href: '/links',     label: 'Links',        Icon: Link2,           accent: '#0CFF70' },
  { href: '/dev',       label: 'Dev Activity', Icon: Terminal,        accent: '#4AFF91' },
  { href: '/home',      label: 'Home Control', Icon: Home,            accent: '#0CFF70' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}

function SidebarContent({
  isMobile,
  onClose,
  pathname,
  collapsed,
  onToggleCollapse,
}: {
  isMobile: boolean
  onClose?: () => void
  pathname: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '16px 8px 0' : '20px 20px 0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '64px',
      }}>
        {!collapsed && (
          <div>
            <span style={{
              display: 'block',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-ghost)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}>
              // PIP-OS ACTIVE
            </span>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-vt)',
              fontWeight: 400,
              fontSize: '22px',
              color: 'var(--pip-green)',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              textShadow: '0 0 10px rgba(12,255,112,0.6), 0 0 22px rgba(12,255,112,0.2)',
            }}>
              SPIDER HILL
            </span>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--pip-amber)',
              letterSpacing: '0.12em',
              marginTop: '1px',
              textShadow: '0 0 8px rgba(255,176,0,0.4)',
            }}>
              UNIT-OS v1.0
            </span>
          </div>
        )}
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground mt-1 -mr-1"
            aria-label="close menu"
          >
            <X size={14} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 text-muted-foreground flex-shrink-0"
            aria-label={collapsed ? 'expand sidebar' : 'collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: collapsed ? '0 4px' : '0 10px', flex: 1 }}>
        {nav.map(({ href, label, Icon, accent }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              title={collapsed ? label : undefined}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : undefined,
                gap: collapsed ? 0 : '12px',
                padding: collapsed ? '8px 10px' : '8px 12px',
                borderRadius: '0',
                borderLeft: `2px solid ${active ? accent : 'transparent'}`,
                background: active ? 'rgba(12,255,112,0.07)' : 'transparent',
                marginBottom: '2px',
                cursor: 'pointer',
                transition: 'background 0.15s',
                boxShadow: active ? `inset 0 0 12px rgba(12,255,112,0.04)` : 'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(12,255,112,0.05)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <Icon size={16} style={{ color: active ? accent : 'var(--text-muted)', flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--pip-green)' : 'var(--text-muted)',
                    textShadow: active ? '0 0 8px rgba(12,255,112,0.4)' : 'none',
                  }}>
                    {label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator className="mb-4" style={{ margin: collapsed ? '0 4px 16px' : '0 10px 16px', background: 'var(--border-subtle)' }} />

      {/* Quick capture */}
      <div style={{ padding: collapsed ? '0 4px 20px' : '0 10px 20px' }}>
        <Link
          href="/capture"
          onClick={isMobile ? onClose : undefined}
          title={collapsed ? 'Quick capture' : undefined}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: collapsed ? 0 : '8px',
            padding: '9px 14px',
            borderRadius: '0',
            background: 'rgba(12,255,112,0.05)',
            border: '1px solid var(--border-mid)',
            cursor: 'pointer',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(12,255,112,0.10)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(12,255,112,0.12)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(12,255,112,0.05)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
          }}
          >
            <Zap size={12} style={{ color: 'var(--pip-amber)', filter: 'drop-shadow(0 0 4px rgba(255,176,0,0.5))' }} />
            {!collapsed && (
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--pip-amber)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Quick Capture
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function Sidebar({
  mobileOpen = false,
  onClose,
  isMobile = false,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
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
      width: collapsed ? '56px' : 'var(--sidebar-w)',
      background: 'var(--bg-surface)',
      borderRight: '0.5px solid var(--border-subtle)',
      zIndex: 100,
      overflow: 'hidden',
      transition: 'width 0.25s ease',
    }}>
      <SidebarContent
        isMobile={false}
        pathname={pathname}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  )
}

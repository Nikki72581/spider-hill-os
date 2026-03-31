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
                {!collapsed && (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
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
            {!collapsed && (
              <span style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}>
                Quick capture
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

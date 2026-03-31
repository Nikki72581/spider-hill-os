'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

const SIDEBAR_COLLAPSED_W = '56px'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()

  const desktopMargin = sidebarCollapsed ? SIDEBAR_COLLAPSED_W : 'var(--sidebar-w)'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        mobileOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isMobile={isMobile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: isMobile ? 0 : desktopMargin,
          transition: 'margin-left 0.25s ease',
        }}
      >
        <Topbar
          onMenuClick={() => setDrawerOpen(true)}
          showMenuButton={isMobile}
        />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px' : '28px 32px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

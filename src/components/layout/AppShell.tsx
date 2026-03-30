'use client'

import { useState } from 'react'
import { useMediaQuery } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Defaults to false on SSR; updates after hydration — avoids mismatch
  const isMobile = useMediaQuery('(max-width: 900px)')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        mobileOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isMobile={isMobile}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: isMobile ? 0 : 'var(--sidebar-w)',
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

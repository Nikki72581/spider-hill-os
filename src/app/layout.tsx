import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import ThemeRegistry from '@/components/ThemeRegistry'

export const metadata: Metadata = {
  title: 'Spider Hill OS',
  description: 'Personal operating system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
          }}>
            <Sidebar />
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginLeft: 'var(--sidebar-w)',
            }}>
              <Topbar />
              <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '28px 32px',
              }}>
                {children}
              </main>
            </div>
          </div>
        </ThemeRegistry>
      </body>
    </html>
  )
}

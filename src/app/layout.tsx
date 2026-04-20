import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'Spider Hill OS',
  description: 'Personal operating system',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Spider Hill OS',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'theme-color': '#020802',
    'msapplication-TileColor': '#020802',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  )
}

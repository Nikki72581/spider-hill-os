import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import SessionProvider from '@/components/SessionProvider'

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
    <html lang="en" className="dark">
      <body>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  )
}

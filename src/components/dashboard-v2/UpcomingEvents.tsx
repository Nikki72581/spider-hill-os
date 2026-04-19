import Link from 'next/link'
import { parseICS } from '@/lib/ics'
import type { CalendarEvent } from '@/app/api/calendar/route'
import UpcomingEventsList from './UpcomingEventsList'

export default async function UpcomingEvents() {
  let events: CalendarEvent[] = []
  try {
    const [stellar, junova] = await Promise.all([
      parseICS(process.env.STELLAR_ICS_URL!, 'stellarone', 'WORK',     7),
      parseICS(process.env.JUNOVA_ICS_URL!,  'junova',     'PERSONAL', 7),
    ])
    events = [...stellar, ...junova]
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 6)
  } catch {}

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      padding: 'var(--d-pad-card)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          // upcoming · 7 days
        </div>
        <Link href="/calendar" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)', letterSpacing: '0.1em', textDecoration: 'none' }}>
          full calendar →
        </Link>
      </div>
      <UpcomingEventsList events={events} />
    </div>
  )
}

import CalendarClient from './CalendarClient'
import { parseICS } from '@/lib/ics'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const stellarUrl = process.env.STELLAR_ICS_URL
  const junovaUrl  = process.env.JUNOVA_ICS_URL

  if (!stellarUrl || !junovaUrl) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        Calendar feeds not configured. Set STELLAR_ICS_URL and JUNOVA_ICS_URL environment variables.
      </div>
    )
  }

  try {
    const [stellar, junova] = await Promise.all([
      parseICS(stellarUrl, 'stellarone', 'WORK',     60),
      parseICS(junovaUrl,  'junova',     'PERSONAL', 60),
    ])

    const events = [...stellar, ...junova].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )

    return <CalendarClient events={events} />
  } catch (err) {
    console.error('Calendar page error:', err)
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        Failed to load calendar feeds. Check server logs for details.
      </div>
    )
  }
}

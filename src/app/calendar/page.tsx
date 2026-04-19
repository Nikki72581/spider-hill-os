import CalendarClient from './CalendarClient'
import { parseICS } from '@/lib/ics'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const [stellar, junova] = await Promise.all([
    parseICS(process.env.STELLAR_ICS_URL!, 'stellarone', 'WORK',     60),
    parseICS(process.env.JUNOVA_ICS_URL!,  'junova',     'PERSONAL', 60),
  ])

  const events = [...stellar, ...junova].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  return <CalendarClient events={events} />
}

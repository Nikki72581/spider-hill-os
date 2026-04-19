import { NextResponse } from 'next/server'
import { parseICS } from '@/lib/ics'

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  isAllDay: boolean
  location?: string
  source: 'stellarone' | 'junova'
  category: 'WORK' | 'PERSONAL'
}

export async function GET() {
  try {
    const [stellar, junova] = await Promise.all([
      parseICS(process.env.STELLAR_ICS_URL!, 'stellarone', 'WORK',     30),
      parseICS(process.env.JUNOVA_ICS_URL!,  'junova',     'PERSONAL', 30),
    ])

    const all = [...stellar, ...junova].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )

    return NextResponse.json(all)
  } catch (err) {
    console.error('Calendar fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch calendar feeds' }, { status: 500 })
  }
}

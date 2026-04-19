import ical from 'node-ical'
import { addDays, startOfDay } from 'date-fns'
import type { CalendarEvent } from '@/app/api/calendar/route'

export async function parseICS(
  url: string,
  source: CalendarEvent['source'],
  category: CalendarEvent['category'],
  days = 30,
): Promise<CalendarEvent[]> {
  const data = await ical.async.fromURL(url)
  const now = startOfDay(new Date())
  const end = addDays(now, days)
  const events: CalendarEvent[] = []

  for (const component of Object.values(data)) {
    if (!component || component.type !== 'VEVENT') continue
    const ev = component as ical.VEvent

    const start = ev.start instanceof Date ? ev.start : new Date(String(ev.start))
    const evEnd = ev.end   instanceof Date ? ev.end   : new Date(String(ev.end))
    if (isNaN(start.getTime()) || start > end || evEnd < now) continue
    if ((ev as any).status === 'CANCELLED') continue

    events.push({
      id:       ev.uid ?? `${source}-${start.toISOString()}`,
      title:    ev.summary?.toString() ?? '(No title)',
      start:    start.toISOString(),
      end:      evEnd.toISOString(),
      isAllDay: !!(ev as any).datetype && (ev as any).datetype === 'date',
      location: ev.location?.toString() || undefined,
      source,
      category,
    })
  }

  return events
}

import ical from 'node-ical'
import { addDays, startOfDay, format } from 'date-fns'
import type { CalendarEvent } from '@/app/api/calendar/route'

export async function parseICS(
  url: string,
  source: CalendarEvent['source'],
  category: CalendarEvent['category'],
  days = 30,
): Promise<CalendarEvent[]> {
  const data = await ical.async.fromURL(url)
  const now  = startOfDay(new Date())
  const end  = addDays(now, days)
  // 1-day buffer on each side to absorb timezone edge cases
  const rangeStart = addDays(now, -1)
  const rangeEnd   = addDays(end, 1)
  const events: CalendarEvent[] = []

  for (const component of Object.values(data)) {
    if (!component || component.type !== 'VEVENT') continue
    const ev = component as ical.VEvent
    if ((ev as any).status === 'CANCELLED') continue

    const start  = ev.start instanceof Date ? ev.start : new Date(String(ev.start))
    const evEnd  = ev.end   instanceof Date ? ev.end   : new Date(String(ev.end))
    if (isNaN(start.getTime())) continue

    const isAllDay = !!(ev as any).datetype && (ev as any).datetype === 'date'

    // ── Recurring events ────────────────────────────────────────────────
    if (ev.rrule) {
      const duration = evEnd.getTime() - start.getTime()
      const occurrences = ev.rrule.between(rangeStart, rangeEnd, true)

      for (const occDate of occurrences) {
        // Skip EXDATE exclusions (node-ical keyed by ISO string or date string)
        if (ev.exdate) {
          const dateKey = format(occDate, 'yyyy-MM-dd')
          const isoKey  = occDate.toISOString()
          if (ev.exdate[dateKey] || ev.exdate[isoKey]) continue
        }

        // Apply RECURRENCE-ID override if present
        const override =
          ev.recurrences?.[occDate.toISOString()] ??
          ev.recurrences?.[format(occDate, 'yyyy-MM-dd')]

        const occStatus = (override as any)?.status ?? (ev as any).status
        if (occStatus === 'CANCELLED') continue

        const rawOccStart = override?.start ?? occDate
        const rawOccEnd   = override?.end   ?? new Date(occDate.getTime() + duration)
        const occStart = rawOccStart instanceof Date ? rawOccStart : new Date(String(rawOccStart))
        const occEnd   = rawOccEnd   instanceof Date ? rawOccEnd   : new Date(String(rawOccEnd))

        if (occEnd < now || occStart > end) continue

        events.push({
          id:       `${ev.uid ?? source}-${occStart.toISOString()}`,
          title:    ((override?.summary ?? ev.summary)?.toString()) ?? '(No title)',
          start:    occStart.toISOString(),
          end:      occEnd.toISOString(),
          isAllDay,
          location: (override?.location ?? ev.location)?.toString() || undefined,
          source,
          category,
        })
      }
      continue
    }

    // ── Single (non-recurring) event ────────────────────────────────────
    if (evEnd < now || start > end) continue

    events.push({
      id:       ev.uid ?? `${source}-${start.toISOString()}`,
      title:    ev.summary?.toString() ?? '(No title)',
      start:    start.toISOString(),
      end:      evEnd.toISOString(),
      isAllDay,
      location: ev.location?.toString() || undefined,
      source,
      category,
    })
  }

  return events
}

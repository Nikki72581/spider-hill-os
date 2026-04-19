'use client'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import type { CalendarEvent } from '@/app/api/calendar/route'

const STELLAR_COLOR = '#FFB000'
const JUNOVA_COLOR  = '#4AE8FF'

function dayLabel(iso: string) {
  const d = parseISO(iso)
  if (isToday(d))    return 'today'
  if (isTomorrow(d)) return 'tomorrow'
  return format(d, 'EEE d')
}

function timeLabel(ev: CalendarEvent) {
  if (ev.isAllDay) return 'all day'
  const d = parseISO(ev.start)
  return format(d, 'h:mma').toLowerCase().replace(':00', '')
}

export default function UpcomingEventsList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-ghost)', padding: '12px 0' }}>
        no events in next 7 days
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map(ev => {
        const color = ev.source === 'stellarone' ? STELLAR_COLOR : JUNOVA_COLOR
        return (
          <div key={ev.id} style={{
            display: 'grid', gridTemplateColumns: '70px 2px 1fr',
            gap: 8, alignItems: 'start', padding: '7px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                {dayLabel(ev.start)}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)' }}>
                {timeLabel(ev)}
              </div>
            </div>
            <div style={{ background: color, alignSelf: 'stretch', marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {ev.title}
              </div>
              {ev.location && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)', marginTop: 1 }}>
                  ⌖ {ev.location}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

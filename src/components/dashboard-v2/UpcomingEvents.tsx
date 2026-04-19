import Link from 'next/link'
import { parseICS } from '@/lib/ics'
import { format, isToday, isTomorrow } from 'date-fns'
import type { CalendarEvent } from '@/app/api/calendar/route'

const STELLAR_COLOR = '#FFB000'
const JUNOVA_COLOR  = '#4AE8FF'

function dayLabel(iso: string) {
  const d = new Date(iso)
  if (isToday(d))    return 'today'
  if (isTomorrow(d)) return 'tomorrow'
  return format(d, 'EEE d')
}

function timeLabel(ev: CalendarEvent) {
  if (ev.isAllDay) return 'all day'
  const d = new Date(ev.start)
  const h = d.getHours(), m = d.getMinutes()
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h < 12 ? 'a' : 'p'}`
}

export default async function UpcomingEvents() {
  let events: CalendarEvent[] = []
  try {
    const [stellar, junova] = await Promise.all([
      parseICS(process.env.STELLAR_ICS_URL!, 'stellarone', 'WORK',    7),
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

      {events.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-ghost)', padding: '12px 0' }}>
          no events in next 7 days
        </div>
      ) : (
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
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{dayLabel(ev.start)}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)' }}>{timeLabel(ev)}</div>
                </div>
                <div style={{ background: color, alignSelf: 'stretch', marginTop: 2 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ev.title}</div>
                  {ev.location && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)', marginTop: 1 }}>⌖ {ev.location}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

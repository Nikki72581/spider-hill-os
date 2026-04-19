'use client'
import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns'
import type { CalendarEvent } from '../api/calendar/route'

const STELLAR_COLOR = '#FFB000'  // amber — work
const JUNOVA_COLOR  = '#4AE8FF'  // cyan — personal

function eventColor(e: CalendarEvent) {
  return e.source === 'stellarone' ? STELLAR_COLOR : JUNOVA_COLOR
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return format(d, 'h:mma').toLowerCase()
}

export default function CalendarClient({ events }: { events: CalendarEvent[] }) {
  const [view, setView]       = useState<'agenda' | 'week'>('agenda')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
            // calendar.view
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: STELLAR_COLOR }}>■ Stellar One</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: JUNOVA_COLOR }}>■ Junova</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-mid)' }}>
          {(['agenda', 'week'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer', border: 0,
              background: view === v ? 'rgba(12,255,112,0.1)' : 'transparent',
              color: view === v ? 'var(--pip-green, #0CFF70)' : 'var(--text-muted)',
              borderRight: v === 'agenda' ? '1px solid var(--border-mid)' : 'none',
            }}>{v}</button>
          ))}
        </div>
      </div>

      {view === 'agenda'
        ? <AgendaView events={events} />
        : <WeekView events={events} weekStart={weekStart} onPrev={() => setWeekStart(w => subWeeks(w, 1))} onNext={() => setWeekStart(w => addWeeks(w, 1))} />
      }
    </div>
  )
}

/* ── AGENDA ─────────────────────────────────────────────────────────── */

function AgendaView({ events }: { events: CalendarEvent[] }) {
  // Group by day
  const groups: Map<string, CalendarEvent[]> = new Map()
  for (const ev of events) {
    const key = format(new Date(ev.start), 'yyyy-MM-dd')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(ev)
  }

  if (groups.size === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-vt)', fontSize: 28, color: 'var(--pip-bright, #4AFF91)', marginBottom: 8 }}>NO EVENTS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>nothing in the next 60 days.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Array.from(groups.entries()).map(([dateKey, evs]) => {
        const date = new Date(dateKey + 'T12:00:00')
        const today = isToday(date)
        return (
          <div key={dateKey}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8,
              paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{
                fontFamily: 'var(--font-vt)', fontSize: 22,
                color: today ? 'var(--pip-bright, #4AFF91)' : 'var(--text-secondary)',
              }}>
                {format(date, 'EEE d')}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {format(date, 'MMMM yyyy')}{today && ' · today'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {evs.map((ev: CalendarEvent) => <AgendaRow key={ev.id} ev={ev} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AgendaRow({ ev }: { ev: CalendarEvent }) {
  const color = eventColor(ev)
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '100px 1fr',
      gap: 12, padding: '8px 12px',
      background: `${color}0d`,
      borderLeft: `2px solid ${color}`,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        {ev.isAllDay ? 'all day' : `${formatTime(ev.start)} – ${formatTime(ev.end)}`}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>{ev.title}</div>
        {ev.location && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            ⌖ {ev.location}
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
          {ev.source === 'stellarone' ? 'stellar one' : 'junova'}
        </div>
      </div>
    </div>
  )
}

/* ── WEEK ────────────────────────────────────────────────────────────── */

const HOUR_H = 40  // px per hour
const DAY_START = 7  // 7am
const DAY_END   = 20 // 8pm
const VISIBLE_HOURS = DAY_END - DAY_START

function WeekView({ events, weekStart, onPrev, onNext }: {
  events: CalendarEvent[]
  weekStart: Date
  onPrev: () => void
  onNext: () => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div>
      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={onPrev} style={navBtn}>← prev</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={onNext} style={navBtn}>next →</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 0, marginBottom: 0 }}>
        <div />
        {days.map(day => (
          <div key={day.toISOString()} style={{
            textAlign: 'center', padding: '6px 0',
            borderBottom: '1px solid var(--border-mid)',
            background: isToday(day) ? 'rgba(12,255,112,0.06)' : 'transparent',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {format(day, 'EEE')}
            </div>
            <div style={{
              fontFamily: 'var(--font-vt)', fontSize: 20,
              color: isToday(day) ? 'var(--pip-bright, #4AFF91)' : 'var(--text-secondary)',
            }}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', position: 'relative' }}>
        {/* Hour labels + horizontal lines */}
        {Array.from({ length: VISIBLE_HOURS }, (_, i) => {
          const hour = DAY_START + i
          return (
            <>
              <div key={`label-${hour}`} style={{
                gridColumn: 1, gridRow: i + 1,
                height: HOUR_H,
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'var(--text-ghost)', textAlign: 'right',
                paddingRight: 6, paddingTop: 2,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                {hour % 12 || 12}{hour < 12 ? 'a' : 'p'}
              </div>
              {days.map((day, di) => (
                <div key={`cell-${hour}-${di}`} style={{
                  gridColumn: di + 2, gridRow: i + 1,
                  height: HOUR_H,
                  borderTop: '1px solid var(--border-subtle)',
                  borderLeft: '1px solid var(--border-subtle)',
                  background: isToday(day) ? 'rgba(12,255,112,0.02)' : 'transparent',
                  position: 'relative',
                }} />
              ))}
            </>
          )
        })}

        {/* Events overlay */}
        {events.map(ev => {
          const start = new Date(ev.start)
          const end   = new Date(ev.end)
          const dayIdx = days.findIndex(d => isSameDay(d, start))
          if (dayIdx === -1) return null

          const startHour = start.getHours() + start.getMinutes() / 60
          const endHour   = Math.min(end.getHours() + end.getMinutes() / 60, DAY_END)
          const top       = Math.max(0, (startHour - DAY_START) * HOUR_H)
          const height    = Math.max(18, (endHour - Math.max(startHour, DAY_START)) * HOUR_H)

          if (startHour >= DAY_END || endHour <= DAY_START) return null

          const color = eventColor(ev)
          return (
            <div key={ev.id} title={`${ev.title}${ev.location ? '\n' + ev.location : ''}`} style={{
              position: 'absolute',
              left:   `calc(${((dayIdx + 1) / 8) * 100}% + 2px)`,
              width:  `calc(${(1 / 8) * 100}% - 4px)`,
              top:    top + (HOUR_H * (DAY_START > 0 ? 0 : 0)),
              height,
              background: `${color}22`,
              borderLeft: `2px solid ${color}`,
              padding: '2px 4px',
              overflow: 'hidden',
              cursor: 'default',
              zIndex: 1,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, lineHeight: 1.3, overflow: 'hidden' }}>
                {ev.isAllDay ? 'all day' : formatTime(ev.start)}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {ev.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  padding: '4px 10px',
  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
  textTransform: 'uppercase', cursor: 'pointer',
  background: 'transparent', border: '1px solid var(--border-mid)',
  color: 'var(--text-muted)',
}

'use client'
import { useState, useEffect, useRef } from 'react'
import {
  format, startOfWeek, addDays, isSameDay,
  addWeeks, subWeeks, isToday, parseISO,
} from 'date-fns'
import type { CalendarEvent } from '../api/calendar/route'

const STELLAR_COLOR = '#FFB000'
const JUNOVA_COLOR  = '#4AE8FF'
const HOUR_H        = 48
const DAY_START     = 7
const DAY_END       = 21
const VISIBLE_HOURS = DAY_END - DAY_START

function eventColor(e: CalendarEvent) {
  return e.source === 'stellarone' ? STELLAR_COLOR : JUNOVA_COLOR
}

function fmtTime(iso: string) {
  const d = parseISO(iso)
  return format(d, 'h:mma').toLowerCase().replace(':00', '')
}

function localTZ() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/* ── Root ─────────────────────────────────────────────────────────────── */

export default function CalendarClient({ events }: { events: CalendarEvent[] }) {
  const [view, setView]         = useState<'agenda' | 'week'>('agenda')
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [tz, setTz] = useState('')

  useEffect(() => { setTz(localTZ()) }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            // calendar.view
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Legend color={STELLAR_COLOR} label="Stellar One" />
            <Legend color={JUNOVA_COLOR}  label="Junova" />
            {tz && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>
                {tz}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-mid)' }}>
          {(['agenda', 'week'] as const).map((v, i) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 18px',
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer', border: 0,
              background: view === v ? 'rgba(12,255,112,0.1)' : 'transparent',
              color: view === v ? 'var(--pip-green, #0CFF70)' : 'var(--text-muted)',
              borderRight: i === 0 ? '1px solid var(--border-mid)' : 'none',
              transition: 'background 0.15s',
            }}>{v}</button>
          ))}
        </div>
      </div>

      {view === 'agenda'
        ? <AgendaView events={events} />
        : (
          <WeekView
            events={events}
            weekStart={weekStart}
            onPrev={() => setWeekStart(w => subWeeks(w, 1))}
            onNext={() => setWeekStart(w => addWeeks(w, 1))}
          />
        )
      }
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, background: color, borderRadius: 1, display: 'inline-block' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
    </span>
  )
}

/* ── Agenda ───────────────────────────────────────────────────────────── */

function AgendaView({ events }: { events: CalendarEvent[] }) {
  const groups = new Map<string, CalendarEvent[]>()
  for (const ev of events) {
    const key = format(parseISO(ev.start), 'yyyy-MM-dd')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(ev)
  }

  if (groups.size === 0) {
    return (
      <div style={{
        padding: '60px 40px', textAlign: 'center',
        border: '1px dashed var(--border-subtle)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ fontFamily: 'var(--font-vt)', fontSize: 32, color: 'var(--pip-bright, #4AFF91)', marginBottom: 8 }}>
          NO EVENTS
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          nothing scheduled in the next 60 days
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Array.from(groups.entries()).map(([dateKey, evs]) => {
        const date  = new Date(dateKey + 'T12:00:00')
        const today = isToday(date)
        return (
          <div key={dateKey}>
            {/* Day header */}
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              marginBottom: 10, paddingBottom: 8,
              borderBottom: `1px solid ${today ? 'rgba(12,255,112,0.3)' : 'var(--border-subtle)'}`,
            }}>
              <span style={{
                fontFamily: 'var(--font-vt)', fontSize: 26,
                color: today ? 'var(--pip-bright, #4AFF91)' : 'var(--text-secondary)',
              }}>
                {format(date, 'EEE d')}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {format(date, 'MMMM yyyy')}
              </span>
              {today && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em',
                  padding: '2px 6px', background: 'rgba(12,255,112,0.12)',
                  border: '1px solid rgba(12,255,112,0.3)',
                  color: 'var(--pip-green, #0CFF70)', textTransform: 'uppercase',
                }}>today</span>
              )}
            </div>

            {/* Events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {evs.map(ev => <AgendaRow key={ev.id} ev={ev} />)}
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
      display: 'grid', gridTemplateColumns: '90px 1fr',
      background: `${color}0d`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '0 2px 2px 0',
      overflow: 'hidden',
      transition: 'background 0.1s',
    }}>
      {/* Time column */}
      <div style={{
        padding: '10px 12px',
        borderRight: `1px solid ${color}22`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {ev.isAllDay ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            all day
          </span>
        ) : (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {fmtTime(ev.start)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {fmtTime(ev.end)}
            </span>
          </>
        )}
      </div>

      {/* Detail column */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>
          {ev.title}
        </div>
        {ev.location && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⌖</span> {ev.location}
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4, opacity: 0.7 }}>
          {ev.source === 'stellarone' ? 'stellar one' : 'junova'}
        </div>
      </div>
    </div>
  )
}

/* ── Week ─────────────────────────────────────────────────────────────── */

function WeekView({ events, weekStart, onPrev, onNext }: {
  events:    CalendarEvent[]
  weekStart: Date
  onPrev:    () => void
  onNext:    () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Scroll to 7am on mount / week change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = DAY_START * HOUR_H - HOUR_H
    }
  }, [weekStart])

  const allDay  = events.filter(ev => ev.isAllDay && days.some(d => isSameDay(d, parseISO(ev.start))))
  const timed   = events.filter(ev => !ev.isAllDay)

  // Current time position
  const now        = new Date()
  const nowHour    = now.getHours() + now.getMinutes() / 60
  const nowTop     = (nowHour - DAY_START) * HOUR_H
  const showNowLine = nowHour >= DAY_START && nowHour < DAY_END

  const isCurrentWeek = days.some(d => isToday(d))

  return (
    <div>
      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button onClick={onPrev} style={navBtn}>← prev</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', flex: 1, textAlign: 'center' }}>
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={onNext} style={navBtn}>next →</button>
      </div>

      {/* All-day strip */}
      {allDay.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-mid)', marginBottom: 0,
        }}>
          <div style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-ghost)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            all<br />day
          </div>
          {days.map(day => {
            const dayAllDay = allDay.filter(ev => isSameDay(parseISO(ev.start), day))
            return (
              <div key={day.toISOString()} style={{
                borderLeft: '1px solid var(--border-subtle)',
                padding: '4px 2px', minHeight: 28,
                background: isToday(day) ? 'rgba(12,255,112,0.03)' : 'transparent',
              }}>
                {dayAllDay.map(ev => (
                  <div key={ev.id} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    background: `${eventColor(ev)}22`,
                    borderLeft: `2px solid ${eventColor(ev)}`,
                    color: eventColor(ev),
                    padding: '2px 4px', marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {ev.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)' }}>
        <div />
        {days.map(day => {
          const dayCount = timed.filter(ev => isSameDay(parseISO(ev.start), day)).length
          return (
            <div key={day.toISOString()} style={{
              textAlign: 'center', padding: '8px 4px',
              borderBottom: `2px solid ${isToday(day) ? 'rgba(12,255,112,0.5)' : 'var(--border-mid)'}`,
              background: isToday(day) ? 'rgba(12,255,112,0.04)' : 'transparent',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {format(day, 'EEE')}
              </div>
              <div style={{
                fontFamily: 'var(--font-vt)', fontSize: 22,
                color: isToday(day) ? 'var(--pip-bright, #4AFF91)' : 'var(--text-secondary)',
                lineHeight: 1.2,
              }}>
                {format(day, 'd')}
              </div>
              {dayCount > 0 && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-ghost)', marginTop: 2 }}>
                  {dayCount} event{dayCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} style={{ height: 520, overflowY: 'auto', position: 'relative' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)',
          position: 'relative',
          height: VISIBLE_HOURS * HOUR_H,
        }}>
          {/* Hour labels */}
          {Array.from({ length: VISIBLE_HOURS }, (_, i) => {
            const hour = DAY_START + i
            return (
              <div key={`lbl-${hour}`} style={{
                gridColumn: 1, gridRow: i + 1,
                height: HOUR_H,
                fontFamily: 'var(--font-mono)', fontSize: 8,
                color: 'var(--text-ghost)', textAlign: 'right',
                paddingRight: 8, paddingTop: 3,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                {hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`}
              </div>
            )
          })}

          {/* Day columns */}
          {days.map((day, di) => (
            <div key={day.toISOString()} style={{
              gridColumn: di + 2, gridRow: `1 / ${VISIBLE_HOURS + 1}`,
              borderLeft: '1px solid var(--border-subtle)',
              background: isToday(day) ? 'rgba(12,255,112,0.015)' : 'transparent',
              position: 'relative',
            }}>
              {/* Hour dividers */}
              {Array.from({ length: VISIBLE_HOURS }, (_, i) => (
                <div key={i} style={{
                  position: 'absolute', top: i * HOUR_H, left: 0, right: 0,
                  borderTop: '1px solid var(--border-subtle)',
                  height: HOUR_H,
                }} />
              ))}

              {/* Current time line */}
              {isToday(day) && showNowLine && isCurrentWeek && (
                <div style={{
                  position: 'absolute', left: 0, right: 0,
                  top: nowTop, zIndex: 10,
                  borderTop: '1.5px solid rgba(255,80,80,0.8)',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', left: -4, top: -4,
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'rgba(255,80,80,0.9)',
                  }} />
                </div>
              )}

              {/* Timed events */}
              {timed
                .filter(ev => isSameDay(parseISO(ev.start), day))
                .map(ev => {
                  const s = parseISO(ev.start)
                  const e = parseISO(ev.end)
                  const startH = s.getHours() + s.getMinutes() / 60
                  const endH   = Math.min(e.getHours() + e.getMinutes() / 60, DAY_END)
                  if (startH >= DAY_END || endH <= DAY_START) return null
                  const top    = Math.max(0, (startH - DAY_START) * HOUR_H)
                  const height = Math.max(20, (endH - Math.max(startH, DAY_START)) * HOUR_H)
                  const color  = eventColor(ev)
                  return (
                    <div key={ev.id} title={`${ev.title}${ev.location ? '\n' + ev.location : ''}`}
                      style={{
                        position: 'absolute', left: 2, right: 2,
                        top, height,
                        background: `${color}1a`,
                        borderLeft: `2px solid ${color}`,
                        borderRadius: '0 2px 2px 0',
                        padding: '3px 5px',
                        overflow: 'hidden', cursor: 'default', zIndex: 2,
                      }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                        {fmtTime(ev.start)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {ev.title}
                      </div>
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  padding: '5px 12px',
  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
  textTransform: 'uppercase', cursor: 'pointer',
  background: 'transparent', border: '1px solid var(--border-mid)',
  color: 'var(--text-muted)',
}

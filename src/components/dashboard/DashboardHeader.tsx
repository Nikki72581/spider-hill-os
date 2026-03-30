'use client'

import { useState, useEffect } from 'react'

const ZONES = [
  { label: 'New York',    tz: 'America/New_York',    abbr: 'ET' },
  { label: 'Chicago',     tz: 'America/Chicago',     abbr: 'CT' },
  { label: 'Denver',      tz: 'America/Denver',      abbr: 'MT' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles', abbr: 'PT' },
  { label: 'Anchorage',   tz: 'America/Anchorage',   abbr: 'AKT' },
  { label: 'Honolulu',    tz: 'Pacific/Honolulu',    abbr: 'HT' },
]

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning.'
  if (hour >= 12 && hour < 21) return 'Good evening.'
  return 'Good night.'
}

function formatTime(date: Date, tz: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: tz,
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
    hour12:   false,
  })
}

function isNighttime(date: Date, tz: string): boolean {
  const hour = parseInt(
    date.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', hour12: false }),
    10,
  )
  return hour >= 21 || hour < 5
}

export default function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const greeting = now ? getGreeting(now.getHours()) : 'Good morning.'

  return (
    <div style={{
      marginBottom:   '32px',
      display:        'flex',
      alignItems:     'flex-start',
      justifyContent: 'space-between',
      gap:            '32px',
      flexWrap:       'wrap',
    }}>
      {/* Greeting */}
      <div>
        <h1 style={{
          fontWeight:    700,
          fontSize:      '28px',
          letterSpacing: '-0.03em',
          color:         'var(--text-primary)',
          marginBottom:  '4px',
        }}>
          {greeting}
        </h1>
        <p style={{
          color:      'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize:   '12px',
        }}>
          Here&apos;s what&apos;s happening across Spider Hill OS.
        </p>
      </div>

      {/* World clock */}
      <div style={{
        display:  'flex',
        gap:      '6px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>
        {ZONES.map(({ label, tz, abbr }) => {
          const dimmed = now ? isNighttime(now, tz) : false
          return (
            <div
              key={tz}
              style={{
                background:   'var(--bg-surface)',
                border:       `0.5px solid ${dimmed ? 'var(--border-subtle)' : 'var(--border-mid)'}`,
                borderRadius: 'var(--radius-md)',
                padding:      '10px 12px',
                minWidth:     '100px',
                transition:   'border-color 0.3s',
              }}
            >
              {/* Time */}
              <div style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     '15px',
                fontWeight:   700,
                color:        dimmed ? 'var(--text-muted)' : 'var(--text-primary)',
                lineHeight:   1,
                marginBottom: '6px',
                letterSpacing: '0.02em',
                transition:   'color 0.3s',
              }}>
                {now ? formatTime(now, tz) : '--:--:--'}
              </div>

              {/* Abbr + dim indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                <span style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '10px',
                  fontWeight:    700,
                  color:         dimmed ? 'var(--text-muted)' : 'var(--neon-cyan)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}>
                  {abbr}
                </span>
                {dimmed && (
                  <span style={{
                    width:        '4px',
                    height:       '4px',
                    borderRadius: '50%',
                    background:   'var(--text-ghost)',
                    flexShrink:   0,
                  }} />
                )}
              </div>

              {/* City */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize:   '10px',
                color:      'var(--text-ghost)',
                lineHeight: 1,
              }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
